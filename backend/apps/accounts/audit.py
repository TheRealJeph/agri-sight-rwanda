from .models import AuditLog


def audit(actor, action: str, outcome: str = 'success', resource: str = '', **metadata) -> None:
    """Record a security event. Callers must never pass passwords, tokens, or session data."""
    AuditLog.objects.create(actor=actor, action=action, outcome=outcome, resource=resource, metadata=metadata)
