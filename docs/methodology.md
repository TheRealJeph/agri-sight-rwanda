# Methodology (verified pipeline, to be moved into backend/services in Phase 4)
Existing, tested scripts: `clean_data_2023_2025.py` (cleaning, weighted district yields, bootstrap intervals) and
`yield_gap.py` (benchmark gap, persistence, robustness checks, evidence strength).
Yield = sum(weight x harvest kg) / sum(weight x crop area ha). Gap = (benchmark - yield) / benchmark.
Low year: gap >= 10% with >= 10 records. Persistent: low in >= 2 years and >= 2/3 of reliable years.
Known limits: three survey years only; many records include expected (not yet harvested) output; 2024 Season B has crop
area for only ~43% of rows; Season C samples are small. Weighted totals (production, area) are NOT yet validated.
