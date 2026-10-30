"""Email-verification and password-reset tokens (no secrets stored in the database)."""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

_VERIFY_SALT = 'agrisight.verify-email'


def make_verification_token(user) -> str:
    return signing.dumps({'uid': user.pk, 'email': user.email}, salt=_VERIFY_SALT)


def read_verification_token(token: str):
    """Return the user, or None if the token is invalid, expired, or for an address that has since changed."""
    try:
        data = signing.loads(token, salt=_VERIFY_SALT, max_age=settings.EMAIL_VERIFICATION_MAX_AGE)
        user = get_user_model().objects.get(pk=data['uid'])
    except (signing.BadSignature, get_user_model().DoesNotExist, KeyError):
        return None
    return user if user.email == data['email'] else None


def make_reset_token(user) -> str:
    """uid.token. Django's generator embeds the password hash, so a link stops working once it has been used,
    and it expires after PASSWORD_RESET_TIMEOUT seconds."""
    return f'{urlsafe_base64_encode(force_bytes(user.pk))}.{default_token_generator.make_token(user)}'


def read_reset_token(token: str):
    try:
        uid_b64, _, tok = token.partition('.')
        user = get_user_model().objects.get(pk=force_str(urlsafe_base64_decode(uid_b64)))
    except (ValueError, TypeError, OverflowError, get_user_model().DoesNotExist):
        return None
    return user if tok and default_token_generator.check_token(user, tok) else None
