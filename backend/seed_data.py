"""
Database seeder for FixUrDevice.
Initializes superuser, staff, technicians, categories, brands, and repair services.
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import UserRole
from apps.services.models import DeviceCategory, DeviceBrand, DeviceModel, RepairService
from apps.parts.models import Vendor

User = get_user_model()


def seed_database():
    print("[*] Starting database seeding...")

    # 1. Create Superadmin User
    admin_user, created = User.objects.get_or_create(
        email="admin@fixurdevice.in",
        defaults={
            "full_name": "System Administrator",
            "role": UserRole.ADMIN,
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
            "phone": "+91 98765 43210",
        },
    )
    admin_user.set_password("admin1234")
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    print(f"[+] Superadmin: admin@fixurdevice.in (pwd: admin1234) - {'Created' if created else 'Updated'}")

    # 2. Create Staff Users & Technicians
    staff_users = [
        {
            "email": "crm@fixurdevice.in",
            "full_name": "Priya Sharma",
            "role": UserRole.CRM_EXECUTIVE,
            "phone": "+91 98765 11111",
            "password": "crm1234",
        },
        {
            "email": "tech1@fixurdevice.in",
            "full_name": "Ramesh Kumar",
            "role": UserRole.TECHNICIAN,
            "phone": "+91 98765 22222",
            "password": "tech1234",
        },
        {
            "email": "tech2@fixurdevice.in",
            "full_name": "Suresh Babu",
            "role": UserRole.TECHNICIAN,
            "phone": "+91 98765 33333",
            "password": "tech1234",
        },
    ]
    for s in staff_users:
        u, _ = User.objects.get_or_create(
            email=s["email"],
            defaults={
                "full_name": s["full_name"],
                "role": s["role"],
                "phone": s["phone"],
                "is_staff": True,
                "is_active": True,
            },
        )
        u.set_password(s["password"])
        u.save()
        print(f"[+] Staff user: {u.full_name} ({u.email}) ready.")

    # 3. Create Device Categories
    categories = [
        {"name": "Smartphones", "slug": "smartphones", "icon": "Smartphone", "display_order": 1},
        {"name": "Laptops", "slug": "laptops", "icon": "Laptop", "display_order": 2},
        {"name": "Tablets", "slug": "tablets", "icon": "Tablet", "display_order": 3},
        {"name": "Smartwatches", "slug": "smartwatches", "icon": "Watch", "display_order": 4},
    ]
    cat_objs = {}
    for cat in categories:
        c, _ = DeviceCategory.objects.get_or_create(
            slug=cat["slug"],
            defaults={"name": cat["name"], "icon": cat["icon"], "display_order": cat["display_order"]},
        )
        cat_objs[cat["slug"]] = c
    print(f"[+] Seeded {len(cat_objs)} device categories.")

    # 4. Create Brands
    brands_data = [
        {"cat": "smartphones", "name": "Apple", "slug": "apple"},
        {"cat": "smartphones", "name": "Samsung", "slug": "samsung"},
        {"cat": "smartphones", "name": "OnePlus", "slug": "oneplus"},
        {"cat": "smartphones", "name": "Xiaomi", "slug": "xiaomi"},
        {"cat": "laptops", "name": "Apple MacBook", "slug": "apple-macbook"},
        {"cat": "laptops", "name": "Dell", "slug": "dell"},
        {"cat": "laptops", "name": "HP", "slug": "hp"},
        {"cat": "laptops", "name": "Lenovo", "slug": "lenovo"},
        {"cat": "tablets", "name": "Apple iPad", "slug": "apple-ipad"},
        {"cat": "tablets", "name": "Samsung Tab", "slug": "samsung-tab"},
        {"cat": "smartwatches", "name": "Apple Watch", "slug": "apple-watch"},
        {"cat": "smartwatches", "name": "Samsung Galaxy Watch", "slug": "samsung-galaxy-watch"},
    ]
    brand_objs = {}
    for b in brands_data:
        br, _ = DeviceBrand.objects.get_or_create(
            category=cat_objs[b["cat"]],
            name=b["name"],
            defaults={"slug": b["slug"]},
        )
        brand_objs[b["slug"]] = br
    print(f"[+] Seeded {len(brand_objs)} device brands.")

    # 5. Create Core Repair Services
    services_data = [
        {"name": "Screen Replacement", "slug": "screen-replacement", "short_desc": "Cracked or malfunctioning display replacement"},
        {"name": "Battery Replacement", "slug": "battery-replacement", "short_desc": "Quick battery replacement for fast draining devices"},
        {"name": "Water Damage Repair", "slug": "water-damage-repair", "short_desc": "Ultrasonic cleaning and liquid damage component restoration"},
        {"name": "Motherboard IC Repair", "slug": "motherboard-ic-repair", "short_desc": "Chip-level BGA and micro-soldering motherboard repair"},
        {"name": "Charging Port Repair", "slug": "charging-port-repair", "short_desc": "Fix charging port loose connections and pin replacement"},
        {"name": "Camera & Lens Repair", "slug": "camera-repair", "short_desc": "Front/rear camera and protective lens repair"},
        {"name": "Back Glass Replacement", "slug": "back-glass-repair", "short_desc": "Laser removal and back glass panel restoration"},
    ]
    phone_cat = cat_objs["smartphones"]
    for idx, s in enumerate(services_data, 1):
        RepairService.objects.get_or_create(
            category=phone_cat,
            slug=s["slug"],
            defaults={
                "name": s["name"],
                "short_description": s["short_desc"],
                "description": f"Professional {s['name']} using genuine-grade components with warranty.",
                "display_order": idx,
            },
        )
    print(f"[+] Seeded {len(services_data)} repair services.")

    # 6. Create Distributors / Vendors
    vendors = [
        {"name": "Apple Authorized Spares India", "contact_person": "Rajesh Sharma", "phone": "+91 99000 11223", "email": "spares@appleparts.in"},
        {"name": "SmartParts Hub Bangalore", "contact_person": "Imran Khan", "phone": "+91 98450 33445", "email": "sales@smartpartshub.com"},
        {"name": "TechDistributors Global", "contact_person": "Vikram Patel", "phone": "+91 98800 55667", "email": "info@techdistributors.in"},
    ]
    for v in vendors:
        Vendor.objects.get_or_create(
            name=v["name"],
            defaults={
                "contact_person": v["contact_person"],
                "phone": v["phone"],
                "email": v["email"],
                "is_active": True,
            },
        )
    print(f"[+] Seeded {len(vendors)} product distributors/vendors.")

    print("[SUCCESS] Database seeded successfully with fresh clean records!")


if __name__ == "__main__":
    seed_database()
