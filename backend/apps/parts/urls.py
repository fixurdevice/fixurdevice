from django.urls import path
from .views import VendorListCreateView, VendorDetailView

urlpatterns = [
    path("vendors/", VendorListCreateView.as_view(), name="vendor-list"),
    path("vendors/<uuid:pk>/", VendorDetailView.as_view(), name="vendor-detail"),
]
