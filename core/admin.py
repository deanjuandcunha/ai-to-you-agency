"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Django Admin Config
"""

from django.contrib import admin
from .models import ServiceOffering, PortfolioProject, ClientInquiry


@admin.register(ServiceOffering)
class ServiceOfferingAdmin(admin.ModelAdmin):
    list_display = ("title", "tech_stack", "order")
    list_editable = ("order",)
    search_fields = ("title", "description", "tech_stack")


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "impact_metric", "created_at")
    list_filter = ("category", "created_at")
    search_fields = ("title", "summary", "impact_metric")


@admin.register(ClientInquiry)
class ClientInquiryAdmin(admin.ModelAdmin):
    list_display = ("full_name", "organization", "email", "phone", "timestamp")
    list_filter = ("timestamp",)
    search_fields = ("full_name", "organization", "email", "message")
    readonly_fields = ("timestamp",)
