"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Django Admin Config
"""

from django.contrib import admin
from .models import ServiceOffering, PortfolioProject, ClientInquiry, AIChatLog


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
    list_display = ("full_name", "organization", "email", "status", "timestamp")
    list_filter = ("status", "timestamp")
    search_fields = ("full_name", "organization", "email", "message")
    readonly_fields = ("timestamp",)


@admin.register(AIChatLog)
class AIChatLogAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "response_time_ms", "user_query_snippet")
    list_filter = ("timestamp",)
    search_fields = ("user_query", "ai_response")
    readonly_fields = ("timestamp", "response_time_ms", "user_query", "ai_response")

    def user_query_snippet(self, obj):
        return obj.user_query[:60] + "..." if len(obj.user_query) > 60 else obj.user_query
    user_query_snippet.short_description = "User Query"

