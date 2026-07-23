"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Core URL Routing
"""

from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    # ── Corporate Page Routes ─────────────────────────────────────────────
    path("", views.company_home, name="home"),
    path("portfolio/", views.portfolio_page, name="portfolio"),

    # ── AJAX / API Endpoints ───────────────────────────────────────────────
    path("api/consultant-chat/", views.chat_api_view, name="chat_api_view"),
    path("api/contact/", views.api_contact, name="api_contact"),
    path("api/ai-chat/", views.api_ai_chat, name="api_ai_chat"),
]
