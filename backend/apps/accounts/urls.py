from django.urls import path

from . import views

urlpatterns = [
    path('auth/csrf/', views.CsrfView.as_view()),
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('auth/logout/', views.LogoutView.as_view()),
    path('auth/me/', views.MeView.as_view()),
    path('auth/verify-email/', views.VerifyEmailView.as_view()),
    path('auth/resend-verification/', views.ResendVerificationView.as_view()),
    path('auth/forgot-password/', views.ForgotPasswordView.as_view()),
    path('auth/reset-password/', views.ResetPasswordView.as_view()),
    path('auth/change-password/', views.ChangePasswordView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('settings/', views.SettingsView.as_view()),
]
