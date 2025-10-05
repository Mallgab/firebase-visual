
// --- Configuration ---
const LATEST_YEAR = '2024';

const CURATED_PURPOSES = [
    'Using e-mail',
    'Making calls (incl. video calls) over the Internet',
    'Participating in social networks',
    'Internet Banking via website or app',
    'Finding information about goods or services',
    'Reading online news sites/ newspapers/ news magazines',
    'Seeking health-related information'
];

const CHART_COLORS = [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
    '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

// Create a color map for purposes
const purposeColorMap = {};
CURATED_PURPOSES.forEach((purpose, i) => {
    purposeColorMap[purpose] = CHART_COLORS[i % CHART_COLORS.length];
});


// --- Theme Management ---

const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

themeToggle.addEventListener('change', switchTheme, false);

// --- Helper Functions ---

function safeParse(value) {
    if (value === '.' || value === '' || value === undefined || value === null) {
        return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.statusText}`);
            return [];
        }
        const text = await response.text();
        const lines = text.split('\n');
        let headerIndex = lines.findIndex(line => line.includes('"Breakdowns"'));
        if (headerIndex === -1) {
            console.error(`Could not find header row in ${url}`);
            return [];
        }
        const csvContent = lines.slice(headerIndex).join('\n');
        const result = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
        return result.data.filter(row => row.Purposes);
    } catch (error) {
        console.error(`Error processing ${url}:`, error);
        return [];
    }
}

// --- Chart Rendering Functions ---

function renderGenderChart(data) {
    const maleData = CURATED_PURPOSES.map(purpose => {
        const row = data.find(d => d.Breakdowns === 'Males' && d.Purposes === purpose);
        return row ? safeParse(row[LATEST_YEAR]) : 0;
    });

    const femaleData = CURATED_PURPOSES.map(purpose => {
        const row = data.find(d => d.Breakdowns === 'Females' && d.Purposes === purpose);
        return row ? safeParse(row[LATEST_YEAR]) : 0;
    });

    new Chart(document.getElementById('genderChart'), {
        type: 'bar',
        data: {
            labels: CURATED_PURPOSES,
            datasets: [
                { label: 'Male', data: maleData, backgroundColor: CHART_COLORS[0], borderWidth: 1 },
                { label: 'Female', data: femaleData, backgroundColor: CHART_COLORS[1], borderWidth: 1 }
            ]
        },
        options: { indexAxis: 'y' }
    });
}

function renderAgeChart(data) {
    const ageGroups = [...new Set(data.map(row => row.Breakdowns))];
    const datasets = CURATED_PURPOSES.map((purpose, i) => ({
        label: purpose,
        data: ageGroups.map(ageGroup => {
            const row = data.find(d => d.Breakdowns === ageGroup && d.Purposes === purpose);
            return row ? safeParse(row[LATEST_YEAR]) : 0;
        }),
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
    }));

    new Chart(document.getElementById('ageChart'), {
        type: 'bar',
        data: { labels: ageGroups, datasets },
        options: { scales: { x: { stacked: true }, y: { stacked: true } } }
    });
}

function renderHeatmapChart(data) {
    const ageGroups = [...new Set(data.map(row => row.Breakdowns))];
    const datasets = CURATED_PURPOSES.slice(0, 5).map((purpose, i) => ({
        label: purpose,
        data: ageGroups.map(ageGroup => {
            const row = data.find(d => d.Breakdowns === ageGroup && d.Purposes === purpose);
            return row ? safeParse(row[LATEST_YEAR]) : 0;
        }),
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
    }));

    new Chart(document.getElementById('heatmapChart'), {
        type: 'bar',
        data: { labels: ageGroups, datasets },
        options: { plugins: { title: { display: true, text: 'Internet Usage by Age Group (Top 5 Purposes)' } } }
    });
}

function renderOvertimeChart(data) {
    const years = Object.keys(data[0] || {}).filter(key => !isNaN(key) && key.length === 4).sort();
    const datasets = CURATED_PURPOSES.map((purpose, i) => {
        const row = data.find(d => d.Purposes === purpose);
        return {
            label: purpose,
            data: row ? years.map(year => safeParse(row[year])) : [],
            borderColor: CHART_COLORS[i % CHART_COLORS.length],
            fill: false,
            spanGaps: true
        };
    });

    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: { labels: years, datasets }
    });
}

function renderGeographyChart(data) {
    const regions = [...new Set(data.map(row => row.Breakdowns))];
    const container = document.getElementById('regionCharts');
    container.innerHTML = '';

    regions.forEach(region => {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'region-chart';
        const canvas = document.createElement('canvas');
        chartDiv.appendChild(canvas);
        container.appendChild(chartDiv);

        const regionData = data
            .filter(row => row.Breakdowns === region)
            .map(row => ({ purpose: row.Purposes, value: safeParse(row[LATEST_YEAR]) }))
            .filter(d => d.value !== null)
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);

        if (regionData.length > 0) {
            new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: regionData.map(d => d.purpose),
                    datasets: [{
                        data: regionData.map(d => d.value),
                        backgroundColor: regionData.map(d => purposeColorMap[d.purpose])
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: region.split('(')[0].trim()
                        }
                    }
                }
            });
        }
    });
}


// --- Main Execution ---

async function main() {
    const [genderData, ageData, geographyData, overtimeData] = await Promise.all([
        fetchData('Gender.csv'),
        fetchData('AGE.csv'),
        fetchData('Geography.csv'),
        fetchData('Overtime.csv')
    ]);

    if (genderData.length > 0) renderGenderChart(genderData);
    if (ageData.length > 0) renderAgeChart(ageData);
    if (ageData.length > 0) renderHeatmapChart(ageData);
    if (overtimeData.length > 0) renderOvertimeChart(overtimeData);
    if (geographyData.length > 0) renderGeographyChart(geographyData);
}

main();
