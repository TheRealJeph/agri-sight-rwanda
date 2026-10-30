# Agri-Sight Rwanda data

This folder contains the data supplied for the NISR Big Data Hackathon project.

- `source/nisr_user_submission.zip`: the original uploaded data archive, preserved without modifying its contents.
- `processed/district_crop_season_year.csv`: cleaned district × crop × season × year summary used by the dashboard.
- `processed/district_crop_year_all_seasons.csv`: cleaned district × crop × year summary across seasons.
- `processed/plot_crop_clean_2023_2025.csv`: supplied cleaned plot/crop-level records.
- `processed/data_quality_report.csv`: supplied cleaning and data-quality report.

The dashboard reads the supplied summary CSV directly and does not rewrite the original data. The raw/plot-level CSV is retained as delivered. Yield charts exclude summary rows not marked `reliable`; the UI explains that these comparisons are screening signals and not causal explanations.
