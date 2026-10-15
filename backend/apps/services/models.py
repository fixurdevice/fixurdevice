"""
Service catalog models.
"""
from django.db import models
from django.utils.text import slugify


class DeviceCategory(models.Model):
    """Top-level device category (e.g., iPhone, Apple Watch, MacBook)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class or name")
    image = models.ImageField(upload_to="services/categories/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "services_device_category"
        ordering = ["display_order", "name"]
        verbose_name_plural = "Device Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class DeviceBrand(models.Model):
    """Device brand (e.g., Apple)."""

    category = models.ForeignKey(DeviceCategory, on_delete=models.CASCADE, related_name="brands")
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True)
    logo = models.ImageField(upload_to="services/brands/", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "services_device_brand"
        unique_together = [("category", "name")]
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.category})"


class DeviceModel(models.Model):
    """Specific device model (e.g., iPhone 15 Pro)."""

    brand = models.ForeignKey(DeviceBrand, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "services_device_model"
        unique_together = [("brand", "name")]
        ordering = ["display_order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.brand.name} {self.name}"


class RepairService(models.Model):
    """
    A type of repair offered (e.g., Screen Replacement, Battery Replacement).
    No pricing is stored here — pricing exists only in internal quotations.
    """

    category = models.ForeignKey(DeviceCategory, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    short_description = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to="services/repairs/", null=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    # SEO
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    seo_content = models.TextField(blank=True, help_text="Extended SEO content for service page")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "services_repair_service"
        ordering = ["display_order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.category.name}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} — {self.name}"


class ServiceArea(models.Model):
    """Bangalore service area (pickup/delivery coverage)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    pincodes = models.JSONField(default=list, help_text="List of served PIN codes")
    is_active = models.BooleanField(default=True)
    requires_confirmation = models.BooleanField(
        default=False,
        help_text="Area requires manual confirmation before scheduling pickup",
    )
    notes = models.TextField(blank=True, help_text="Internal coverage notes")

    class Meta:
        db_table = "services_area"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
