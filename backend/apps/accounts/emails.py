import logging

from django.conf import settings
from django.core.mail import send_mail

from .tokens import make_reset_token, make_verification_token

logger = logging.getLogger(__name__)


def send_verification_email(user) -> bool:
    """
    Send an account verification email.

    Returns True when Django reports successful delivery to the
    configured email backend. Returns False if delivery fails.
    """
    try:
        link = (
            f'{settings.FRONTEND_ORIGIN.rstrip("/")}'
            f'/verify-email?token={make_verification_token(user)}'
        )

        sent = send_mail(
            subject='Verify your Agri-Sight Rwanda email',
            message=(
                f'Hello {user.profile.full_name},\n\n'
                'Confirm your email address to activate your account:\n'
                f'{link}\n\n'
                'This link is valid for 24 hours. '
                'If you did not create an account, ignore this message.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return sent == 1

    except Exception:
        # Do not log passwords, email contents, or verification tokens.
        logger.exception(
            'Verification email delivery failed for user_id=%s',
            user.pk,
        )
        return False


def send_password_reset_email(user) -> bool:
    """
    Send a password-reset email.

    Returns True when Django reports successful delivery to the
    configured email backend. Returns False if delivery fails.
    """
    try:
        link = (
            f'{settings.FRONTEND_ORIGIN.rstrip("/")}'
            f'/reset-password/{make_reset_token(user)}'
        )

        sent = send_mail(
            subject='Reset your Agri-Sight Rwanda password',
            message=(
                'Hello,\n\n'
                'Use this link to choose a new password. '
                'It expires in 15 minutes and works once:\n'
                f'{link}\n\n'
                'If you did not ask for this, ignore this message; '
                'your password has not changed.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return sent == 1

    except Exception:
        logger.exception(
            'Password-reset email delivery failed for user_id=%s',
            user.pk,
        )
        return False