"""
Customer serializers.
"""
from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    whatsapp_url = serializers.CharField(read_only=True)
    display_phone = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id", "full_name", "phone", "display_phone", "email", "alternate_phone",
            "address_line1", "address_line2", "area", "pincode", "city",
            "preferred_contact_method", "whatsapp_url",
            "privacy_consent", "internal_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CustomerBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "full_name", "phone", "email", "area", "pincode"]
