"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Views & API Controllers

Renders corporate pages dynamically from Django database models and provides AJAX endpoints
for client inquiries and the embedded Groq AI Virtual Consultant.
"""

import json
import logging
import time

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .ai_consultant import AIToYouConsultant
from .models import AIChatLog, ClientInquiry, PortfolioProject, ServiceOffering

logger = logging.getLogger(__name__)


# ── Page Views ───────────────────────────────────────────────────────────────

@require_GET
def company_home(request):
    """
    Renders the official corporate agency home page dynamically:
    - Service offerings (Services Suite)
    - Portfolio projects (Featured Real CV Case Studies)
    - Founder spotlight context for Dean Juan D'Cunha
    """
    services = ServiceOffering.objects.all()
    projects = PortfolioProject.objects.all()

    context = {
        "services": services,
        "projects": projects,
        "page_title": "AI-->TO-->YOU Technologies | Enterprise AI & Software Agency",
        "meta_description": (
            "AI-->TO-->YOU Technologies delivers custom NLP engines, semantic search, "
            "HR resume screening systems, marine signal processing, and scalable Django web portals."
        ),
    }
    return render(request, "company_home.html", context)


@require_GET
def portfolio_page(request):
    """Renders the dedicated portfolio showcase page for all company case studies."""
    category = request.GET.get("category", "")
    if category:
        projects = PortfolioProject.objects.filter(category=category)
    else:
        projects = PortfolioProject.objects.all()

    context = {
        "projects": projects,
        "current_category": category,
        "categories": PortfolioProject.CATEGORY_CHOICES,
        "page_title": "Featured Case Studies & Portfolio | AI-->TO-->YOU",
    }
    return render(request, "portfolio.html", context)


# ── AJAX / API Endpoints ─────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def chat_api_view(request):
    """
    Groq AI Virtual Consultant endpoint for real-time conversation.
    Accepts JSON POST with:
    - 'message' or 'user_message': string
    - 'chat_history': optional list of past messages [{"role": "user"|"assistant", "content": "..."}]

    Returns clean JSON payload: {"reply": "...", "ok": True}
    """
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"ok": False, "error": "Invalid JSON payload provided."}, status=400)

    user_message = data.get("message") or data.get("user_message") or data.get("question", "")
    user_message = str(user_message).strip()

    if not user_message:
        return JsonResponse({"ok": False, "error": "Please provide a valid question or message."}, status=422)

    chat_history = data.get("chat_history", [])
    if not isinstance(chat_history, list):
        chat_history = []

    start_time = time.time()
    consultant = AIToYouConsultant()
    reply_text = consultant.get_response(user_message=user_message, chat_history=chat_history)
    elapsed_ms = int((time.time() - start_time) * 1000)

    # Save to AIChatLog audit history
    try:
        AIChatLog.objects.create(
            user_query=user_message,
            ai_response=reply_text,
            response_time_ms=elapsed_ms,
        )
    except Exception as e:
        logger.warning(f"Failed to record AIChatLog: {e}")

    return JsonResponse({
        "ok": True,
        "reply": reply_text,
        "response_time_ms": elapsed_ms,
        "data": {
            "answer": reply_text,
            "category": "Groq AI Consultant",
            "suggested_actions": ["Book Consultation", "Explore Services", "Contact Founder"],
        }
    })


@csrf_exempt
@require_POST
def api_contact(request):
    """
    Handles corporate contact form submissions asynchronously via AJAX.
    Validates input, saves to ClientInquiry database model, and returns JSON status.
    """
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"ok": False, "error": "Invalid JSON format provided."}, status=400)

    full_name = str(data.get("full_name", "")).strip()
    organization = str(data.get("organization", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    message = str(data.get("message", "")).strip()

    missing = []
    if not full_name:
        missing.append("Full Name")
    if not organization:
        missing.append("Organization")
    if not email:
        missing.append("Email Address")
    if not message:
        missing.append("Message Details")

    if missing:
        return JsonResponse(
            {"ok": False, "error": f"Please complete required fields: {', '.join(missing)}."},
            status=422,
        )

    # Save to database
    inquiry = ClientInquiry.objects.create(
        full_name=full_name,
        organization=organization,
        email=email,
        phone=phone,
        message=message,
    )

    return JsonResponse({
        "ok": True,
        "message": f"Thank you, {full_name}! Your inquiry has been dispatched directly to founder Dean Juan D'Cunha. We will reach out within 24 hours.",
        "inquiry_id": inquiry.id,
    })


@csrf_exempt
@require_POST
def api_ai_chat(request):
    """
    Backwards-compatible wrapper delegating to chat_api_view.
    """
    return chat_api_view(request)
