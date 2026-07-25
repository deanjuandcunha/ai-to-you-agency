"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Core URL Routing
"""

from django.urls import path
from . import views, admin_views

app_name = "core"

urlpatterns = [
    # ── Corporate Page Routes ─────────────────────────────────────────────
    path("", views.company_home, name="home"),
    path("portfolio/", views.portfolio_page, name="portfolio"),

    # ── Executive Admin Dashboard Routes ─────────────────────────────────
    path("agency-admin/", admin_views.dashboard_overview_view, name="agency_admin_dashboard"),
    path("agency-admin/logout/", admin_views.agency_admin_logout_view, name="agency_admin_logout"),
    path("agency-admin/inquiry/update/<int:pk>/", admin_views.update_inquiry_status_view, name="agency_admin_update_inquiry"),
    path("agency-admin/export-csv/", admin_views.export_inquiries_csv_view, name="agency_admin_export_csv"),

    # ── AJAX / API Endpoints ───────────────────────────────────────────────
    path("api/consultant-chat/", views.chat_api_view, name="chat_api_view"),
    path("api/contact/", views.api_contact, name="api_contact"),
    path("api/ai-chat/", views.api_ai_chat, name="api_ai_chat"),
]

