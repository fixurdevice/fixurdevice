"""
Serializers for parts and vendor distribution management.
"""
from rest_framework import serializers
from .models import Vendor, Part, PartUsage


class VendorSerializer(serializers.ModelSerializer):
    parts_count = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            "id", "name", "contact_person", "phone", "email", "address",
            "notes", "is_active", "parts_count", "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def get_parts_count(self, obj):
        return obj.parts.count()
