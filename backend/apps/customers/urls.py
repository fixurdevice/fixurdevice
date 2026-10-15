from django.urls import path
from . import views

urlpatterns = [
    path("", views.CustomerListView.as_view(), name="customer-list"),
    path("<uuid:pk>/", views.CustomerDetailView.as_view(), name="customer-detail"),
    path("clear/", views.clear_all_customers, name="customer-clear"),
]
