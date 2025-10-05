
# Project Blueprint

## Overview

A web application to visualize internet usage data based on gender, age, and geography. The application will feature five interactive charts to explore the data.

## Key Features

1.  **Purpose of Use by Gender:** A diverging bar chart comparing internet usage purposes between genders.
2.  **Purpose of Use by Age Group:** A stacked column chart showing how internet usage purposes vary across different age groups.
3.  **Gender–Age Matrix Heatmap:** A heatmap to identify popular internet usage purposes across different age groups.
4.  **Trend Over Time:** A multi-line chart illustrating the change in internet usage for key purposes over time.
5.  **Top 3 Purposes by Region:** A series of donut charts showing the top three internet usage purposes for each geographical region.

## Design & Style

*   **Layout:** A clean, modern, and responsive layout that presents the charts in a clear and organized manner.
*   **Color Palette:** A consistent and accessible color palette will be used for different data categories across all charts.
*   **Interactivity:** Charts will include tooltips to provide detailed information on hover.

## Plan for Current Request

1.  **Create `blueprint.md`:** Document the project plan.
2.  **Create `index.html`:** Set up the basic structure of the web application.
3.  **Create `style.css`:** Define the styles for the application.
4.  **Create `main.js`:**
    *   Load and parse the CSV data from `Gender.csv`, `AGE.csv`, and `Geography.csv`.
    *   Implement the five charts using Chart.js.
