from django.urls import path
from . import views

urlpatterns = [
    path("invoices/", views.InvoiceListView.as_view(), name="invoice-list"),
    path("invoices/<uuid:pk>/", views.InvoiceDetailView.as_view(), name="invoice-detail"),
    path("invoices/<uuid:pk>/pdf/", views.download_invoice_pdf_view, name="invoice-pdf"),
    path("invoices/<str:pk>/pdf/", views.download_invoice_pdf_view, name="invoice-pdf-by-number"),
    path("invoices/clear/", views.clear_all_invoices, name="clear-invoices"),
    path("clear/", views.clear_all_invoices, name="clear-payments"),
]
