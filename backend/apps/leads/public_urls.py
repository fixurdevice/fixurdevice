from django.urls import path
from . import public_views

urlpatterns = [
    path("submit/", public_views.submit_enquiry, name="public-enquiry-submit"),
]
