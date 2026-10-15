from django.urls import path
from . import views

urlpatterns = [
    path("", views.RepairOrderListView.as_view(), name="repair-list"),
    path("<uuid:pk>/", views.RepairOrderDetailView.as_view(), name="repair-detail"),
    path("technicians/", views.technicians_list_create_view, name="technicians-list-create"),
    path("clear/", views.clear_all_repairs, name="clear-repairs"),
]
