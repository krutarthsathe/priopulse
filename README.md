# PrioPulse

A Next.js App Router conversion of the mirrored PrioPulse `patients.html` page. The original responsive layout, colors, sidebar, patient rows, map, and appointment chart are preserved.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000 or http://localhost:3000/patients.

```sh
npm run build
npm start
```

## Included behavior

- Search the six sample patients by name, address, gender, category, treatment, or payment.
- Switch row density and page size; pagination includes newly added patients.
- Add patients through the validated form. New records remain in memory until reload.
- Switch light/dark theme and expand/collapse the sidebar; preferences use local storage.
- Open mobile navigation, navigation groups, header menus, and period selectors.
- Render the US map and appointment chart using locally installed packages and map data.

The source contains only six patient records. The original placeholder count of 1,000 is replaced with the real record count. Period selectors retain their source presentation behavior; the source does not include dated records or alternative chart datasets. Other sidebar destinations, photo upload, and backend persistence are not implemented. The row action button shows a summary of the selected sample patient.

## Structure

- `app/`: routes, metadata, and the source stylesheet.
- `components/PatientsPage.jsx`: page markup and client interactions.
- `components/Navigation.jsx` and `components/Header.jsx`: reusable dashboard navigation.
- `components/PatientRow.jsx`: patient table rows.
- `components/patients-data.json`: source sample records and search text.
- `components/charts.js`: client-only map/chart mounting and cleanup.
- `public/assets/images/`: copied source images.

Fonts load from Google Fonts; images, icon fonts, chart libraries, and map geometry are local. This is a frontend demo with no API or database.
