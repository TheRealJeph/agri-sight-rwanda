from django.db import connection
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@extend_schema(responses=inline_serializer("Health", {"status": serializers.CharField(), "database": serializers.CharField(),
                                                       "version": serializers.CharField()}))
@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Public liveness check. Reports whether the database connection works."""
    try:
        connection.ensure_connection()
        db = "ok"
    except Exception:  # never leak connection details to clients
        db = "unavailable"
    return Response({"status": "ok" if db == "ok" else "degraded", "database": db, "version": "1.0.0"},
                    status=200 if db == "ok" else 503)
