"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Core Data Models

Defines the domain models for the corporate agency platform:
- ServiceOffering: Core AI & software consulting service pillars.
- PortfolioProject: Showcase projects and case studies based on founder CV track record.
- ClientInquiry: Inbound prospective client consulting inquiries.
"""

from django.db import models


class ServiceOffering(models.Model):
    """A core service pillar offered by AI-->TO-->YOU Technologies."""

    title = models.CharField(max_length=200)
    description = models.TextField()
    icon_name = models.CharField(
        max_length=100,
        help_text="FontAwesome icon class name or SVG identifier (e.g. 'fa-robot', 'fa-user-check', 'fa-wave-square', 'fa-shield-halved')",
    )
    tech_stack = models.CharField(
        max_length=300,
        help_text="Comma-separated tech stack highlights (e.g. 'Python, Cohere API, OpenAI, Django')",
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Display priority order on the home page",
    )

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "Service Offerings"

    def __str__(self):
        return self.title

    @property
    def tech_list(self):
        return [item.strip() for item in self.tech_stack.split(",") if item.strip()]


class PortfolioProject(models.Model):
    """A showcased case study or project built by AI-->TO-->YOU / Dean Juan D'Cunha."""

    CATEGORY_CHOICES = [
        ("nlp", "Enterprise NLP & Chatbots"),
        ("hr", "AI HR & Resume Analytics"),
        ("deep_learning", "Signal Analysis & Deep Learning"),
        ("b2g", "B2G & Smart City OS"),
        ("qa", "Web Engineering & Audit"),
    ]

    title = models.CharField(max_length=300)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="nlp")
    summary = models.TextField()
    impact_metric = models.CharField(
        max_length=300,
        help_text="Quantifiable KPI or achievement (e.g. '98% candidate matching precision')",
    )
    project_url = models.URLField(blank=True, default="#")
    tech_used = models.CharField(
        max_length=300,
        default="Python, Django, Cohere, Tailwind CSS",
        help_text="Tech stack used for this project",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Portfolio Projects"

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

    @property
    def category_label(self):
        return self.get_category_display()


class ClientInquiry(models.Model):
    """Inbound prospective client lead captured via the interactive glassmorphic contact form."""

    full_name = models.CharField(max_length=200)
    organization = models.CharField(max_length=300)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "Client Inquiries"

    def __str__(self):
        return f"{self.full_name} — {self.organization} ({self.timestamp:%Y-%m-%d %H:%M})"
