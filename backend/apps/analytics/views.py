import csv
from functools import lru_cache
from pathlib import Path

from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

DATA_DIR = settings.BASE_DIR / "data" / "processed"
SUMMARY_FILE = DATA_DIR / "district_crop_season_year.csv"
ALL_SEASONS_FILE = DATA_DIR / "district_crop_year_all_seasons.csv"
QUALITY_FILE = DATA_DIR / "data_quality_report.csv"


@lru_cache(maxsize=1)
def _read_csv(path_string):
    path = Path(path_string)
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def _number(row, key, default=0.0):
    try:
        value = float(row.get(key, default))
        return value if value == value else default
    except (TypeError, ValueError):
        return default


class DashboardDataView(APIView):
    """Read-only analytics over the user's cleaned NISR 2023â€“2025 files."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        rows = _read_csv(str(SUMMARY_FILE))
        if not rows:
            return Response({"detail": "Cleaned NISR summary data was not found. Check data/processed."}, status=503)

        years = sorted({int(_number(r, "year")) for r in rows})
        seasons = sorted({r["season"] for r in rows if r.get("season")})
        crops = sorted({r["crop"] for r in rows if r.get("crop")})
        districts = sorted({r["district"] for r in rows if r.get("district")})
        provinces = sorted({r["province"] for r in rows if r.get("province")})

        year = request.query_params.get("year", "all")
        season = request.query_params.get("season", "all")
        crop = request.query_params.get("crop", "all")
        district = request.query_params.get("district", "all")
        filtered = rows
        if year != "all":
            filtered = [r for r in filtered if str(r.get("year")) == year]
        if season != "all":
            filtered = [r for r in filtered if r.get("season") == season]
        if crop != "all":
            filtered = [r for r in filtered if r.get("crop") == crop]
        if district != "all":
            filtered = [r for r in filtered if r.get("district") == district]

        reliable = [r for r in filtered if str(r.get("reliable", "")).lower() == "true"]
        weighted_values = [_number(r, "weighted_yield_kg_ha") for r in reliable]
        avg_yield = round(sum(weighted_values) / len(weighted_values), 2) if weighted_values else 0
        national_values = [_number(r, "national_weighted_yield_kg_ha") for r in filtered]
        national_yield = round(sum(national_values) / len(national_values), 2) if national_values else 0
        total_records = sum(int(_number(r, "n_records")) for r in filtered)
        total_farmers = sum(int(_number(r, "n_farmers")) for r in filtered)

        by_year = []
        for y in years:
            group = [r for r in reliable if int(_number(r, "year")) == y]
            vals = [_number(r, "weighted_yield_kg_ha") for r in group]
            if group:
                by_year.append({"year": str(y), "yield": round(sum(vals) / len(vals), 2), "districts": len({r["district"] for r in group})})

        by_crop = []
        for name in sorted({r["crop"] for r in reliable}):
            group = [r for r in reliable if r["crop"] == name]
            vals = [_number(r, "weighted_yield_kg_ha") for r in group]
            by_crop.append({"crop": name, "yield": round(sum(vals) / len(vals), 2), "records": sum(int(_number(r, "n_records")) for r in group)})
        by_crop.sort(key=lambda x: x["yield"], reverse=True)

        by_district = []
        for name in sorted({r["district"] for r in reliable}):
            group = [r for r in reliable if r["district"] == name]
            vals = [_number(r, "weighted_yield_kg_ha") for r in group]
            by_district.append({"district": name, "province": group[0].get("province", ""), "yield": round(sum(vals) / len(vals), 2), "records": sum(int(_number(r, "n_records")) for r in group)})
        by_district.sort(key=lambda x: x["yield"])

        filtered_years = [int(_number(r, "year")) for r in filtered]
        latest_year = max(filtered_years) if filtered_years else max(years)
        latest = [r for r in reliable if int(_number(r, "year")) == latest_year]
        quality_rows = _read_csv(str(QUALITY_FILE))
        quality_years = sorted({r.get("year") for r in quality_rows if r.get("year")})

        return Response({
            "source": "NISR Seasonal Agricultural Survey; user-provided cleaned files",
            "period": f"{min(years)}â€“{max(years)}",
            "filters": {"years": years, "seasons": seasons, "crops": crops, "districts": districts, "provinces": provinces},
            "summary": {
                "district_crop_rows": len(filtered),
                "reliable_rows": len(reliable),
                "average_yield_kg_ha": avg_yield,
                "national_reference_yield_kg_ha": national_yield,
                "farmer_observations": total_farmers,
                "plot_records": total_records,
                "districts_covered": len({r["district"] for r in filtered}),
                "crops_covered": len({r["crop"] for r in filtered}),
            },
            "by_year": by_year,
            "by_crop": by_crop[:10],
            "districts_lowest_yield": by_district[:10],
            "districts_highest_yield": list(reversed(by_district[-10:])),
            "latest_year_crop_district": [
                {"crop": r["crop"], "district": r["district"], "province": r["province"], "yield": round(_number(r, "weighted_yield_kg_ha"), 2), "records": int(_number(r, "n_records")), "reliable": str(r.get("reliable", "")).lower() == "true"}
                for r in latest[:200]
            ],
            "quality_years": quality_years,
        })


class DatasetInfoView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        files = []
        for name in ("district_crop_season_year.csv", "district_crop_year_all_seasons.csv", "plot_crop_clean_2023_2025.csv", "data_quality_report.csv"):
            path = DATA_DIR / name
            files.append({"name": name, "available": path.exists(), "bytes": path.stat().st_size if path.exists() else 0})
        return Response({"source": "NISR Seasonal Agricultural Survey", "period": "2023â€“2025", "files": files})
