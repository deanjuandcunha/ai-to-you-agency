"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Executive Admin Dashboard Controllers

Provides secure, superuser-restricted analytics endpoints and AJAX handlers for:
- Executive Analytics Overview & Key Performance Indicators (KPIs)
- Inquiry status tracking (New, Contacted, Closed) via AJAX
- CSV audit export generator for corporate inquiry records
"""

import csv
import json
from datetime import datetime, timedelta

from django.contrib.auth import logout
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import AIChatLog, ClientInquiry, PortfolioProject, ServiceOffering


# ── Security Decorator ───────────────────────────────────────────────────────
def superuser_required(view_func):
    """
    Decorator for views that checks whether the user is authenticated and is a superuser,
    redirecting to the admin login page if unauthenticated or unauthorized.
    """
    actual_decorator = user_passes_test(
        lambda u: u.is_authenticated and u.is_superuser,
        login_url="/admin/login/",
        redirect_field_name="next",
    )
    return actual_decorator(view_func)


# ── Dashboard Views & Endpoints ──────────────────────────────────────────────

@superuser_required
def agency_admin_logout_view(request):
    """
    Logs out the executive admin superuser and redirects back to the public homepage.
    """
    logout(request)
    return redirect("core:home")


@superuser_required
@require_GET
def dashboard_overview_view(request):
    """
    Aggregates high-level metrics, analytical chart datasets, recent inquiries,
    and live AI Virtual Consultant logs for the Anti-Gravity Executive Dashboard.
    """
    # 1. Key Performance Metrics
    total_inquiries = ClientInquiry.objects.count()
    unread_inquiries = ClientInquiry.objects.filter(status="new").count()
    ai_conversations_count = AIChatLog.objects.count()
    active_projects_count = PortfolioProject.objects.count()

    # 2. Recent Records (Preserve up to 50 recent & historical inquiries)
    recent_inquiries = ClientInquiry.objects.all().order_by("-timestamp")[:50]
    recent_ai_chats = AIChatLog.objects.all().order_by("-timestamp")[:15]

    # 3. Chart 1: AI Query Volume (Last 7 Days)
    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=6)
    
    # Query AI logs grouped by date
    daily_ai_logs = (
        AIChatLog.objects.filter(timestamp__date__gte=seven_days_ago)
        .annotate(date=TruncDate("timestamp"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    daily_map = {item["date"]: item["count"] for item in daily_ai_logs}

    ai_chart_labels = []
    ai_chart_data = []
    for i in range(7):
        current_date = seven_days_ago + timedelta(days=i)
        ai_chart_labels.append(current_date.strftime("%b %d"))
        ai_chart_data.append(daily_map.get(current_date, 0))

    # 4. Chart 2: Inquiry Breakdown (Status & Category)
    inquiry_status_counts = {
        "New": ClientInquiry.objects.filter(status="new").count(),
        "Contacted": ClientInquiry.objects.filter(status="contacted").count(),
        "Closed": ClientInquiry.objects.filter(status="closed").count(),
    }
    
    status_chart_labels = list(inquiry_status_counts.keys())
    status_chart_data = list(inquiry_status_counts.values())

    # Calculate average AI response latency (ms)
    avg_latency = 0
    if ai_conversations_count > 0:
        logs_with_latency = AIChatLog.objects.exclude(response_time_ms=0)
        if logs_with_latency.exists():
            avg_latency = int(sum(l.response_time_ms for l in logs_with_latency) / logs_with_latency.count())

    context = {
        # Metrics
        "total_inquiries": total_inquiries,
        "unread_inquiries": unread_inquiries,
        "ai_conversations_count": ai_conversations_count,
        "active_projects_count": active_projects_count,
        "avg_latency": avg_latency,
        
        # Lists
        "recent_inquiries": recent_inquiries,
        "recent_ai_chats": recent_ai_chats,
        
        # JSON-serialized Chart Data for JS Consumption
        "ai_chart_labels_json": json.dumps(ai_chart_labels),
        "ai_chart_data_json": json.dumps(ai_chart_data),
        "status_chart_labels_json": json.dumps(status_chart_labels),
        "status_chart_data_json": json.dumps(status_chart_data),
        
        "page_title": "Executive Control Center | AI-->TO-->YOU Admin",
    }
    return render(request, "admin_dashboard/index.html", context)


@superuser_required
@csrf_exempt
@require_POST
def update_inquiry_status_view(request, pk):
    """
    AJAX Endpoint to update the status of a Client Inquiry in real-time.
    Payload: {"status": "contacted" | "closed" | "new"}
    """
    inquiry = get_object_or_404(ClientInquiry, pk=pk)

    try:
        data = json.loads(request.body)
        new_status = data.get("status", "").strip().lower()
    except (json.JSONDecodeError, TypeError):
        new_status = request.POST.get("status", "").strip().lower()

    valid_statuses = [choice[0] for choice in ClientInquiry.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return JsonResponse(
            {
                "ok": False,
                "error": f"Invalid status '{new_status}'. Allowed options: {', '.join(valid_statuses)}.",
            },
            status=400,
        )

    inquiry.status = new_status
    inquiry.save(update_fields=["status"])

    status_counts = {
        "New": ClientInquiry.objects.filter(status="new").count(),
        "Contacted": ClientInquiry.objects.filter(status="contacted").count(),
        "Closed": ClientInquiry.objects.filter(status="closed").count(),
    }

    return JsonResponse({
        "ok": True,
        "inquiry_id": inquiry.id,
        "new_status": inquiry.status,
        "status_display": inquiry.get_status_display(),
        "unread_count": status_counts["New"],
        "status_counts": status_counts,
        "message": f"Inquiry #{inquiry.id} status updated to {inquiry.get_status_display()}.",
    })



@superuser_required
@require_GET
def export_inquiries_csv_view(request):
    """
    Generates and streams a formatted CSV report containing all client inquiry records
    for corporate auditing, CRM export, and executive review.
    """
    response = HttpResponse(content_type="text/csv")
    filename = f"AI_TO_YOU_Client_Inquiries_{datetime.now():%Y%m%d_%H%M%S}.csv"
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    writer = csv.writer(response)
    # Write CSV Header
    writer.writerow([
        "Inquiry ID",
        "Full Name",
        "Organization",
        "Email",
        "Phone",
        "Status",
        "Message",
        "Timestamp (UTC)",
    ])

    # Write Data Rows
    inquiries = ClientInquiry.objects.all().order_by("-timestamp")
    for inq in inquiries:
        writer.writerow([
            inq.id,
            inq.full_name,
            inq.organization,
            inq.email,
            inq.phone,
            inq.get_status_display(),
            inq.message.replace("\n", " "),
            inq.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        ])

    return response
