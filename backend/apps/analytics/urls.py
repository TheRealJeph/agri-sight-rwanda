from django.urls import path
from .views import DashboardDataView, DatasetInfoView

urlpatterns = [
    path('dashboard/', DashboardDataView.as_view(), name='dashboard-data'),
    path('datasets/', DatasetInfoView.as_view(), name='dataset-info'),
]
