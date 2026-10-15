from django.urls import path
from . import views

urlpatterns = [
    path("", views.LeadListView.as_view(), name="lead-list"),
    path("<uuid:pk>/", views.LeadDetailView.as_view(), name="lead-detail"),
    path("<uuid:pk>/action/", views.lead_action_view, name="lead-action"),
    path("<str:pk>/action/", views.lead_action_view, name="lead-action-str"),
    path("<uuid:pk>/reschedule-callback/", views.callback_reschedule_view, name="lead-reschedule"),
    path("<uuid:pk>/restore/", views.restore_lead_view, name="lead-restore"),
    path("stats/", views.crm_dashboard_stats, name="crm-stats"),
    path("dashboard/stats/", views.crm_dashboard_stats, name="dashboard-stats"),
    path("clear/", views.clear_all_leads, name="clear-leads"),
]
