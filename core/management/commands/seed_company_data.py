"""
ZeroGrav Systems — Seed Company Data

Django management command that populates the database with production-ready
company capabilities and the flagship Abu Dhabi Civic OS case study.

Usage:
    python manage.py seed_company_data
"""

from django.core.management.base import BaseCommand
from core.models import CompanyCapability, CaseStudy


class Command(BaseCommand):
    help = "Seed the database with ZeroGrav Systems company capabilities and flagship case study."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING(">> Seeding ZeroGrav Systems company data..."))

        # ── Capabilities ──────────────────────────────────────────────────
        capabilities_data = [
            {
                "title": "Autonomous Workflow Engineering",
                "description": (
                    "We design and deploy self-orchestrating government workflows that eliminate "
                    "manual bottlenecks. Our AI-driven pipeline engine processes permit applications, "
                    "inter-agency approvals, and citizen service requests with sub-second routing — "
                    "reducing average processing times by 40%. Every workflow includes configurable "
                    "human-in-the-loop checkpoints for critical decision gates."
                ),
                "icon_class": "icon-workflow",
                "order": 1,
            },
            {
                "title": "Sovereign LLM Routing (Falcon / Groq)",
                "description": (
                    "ZeroGrav integrates sovereign large language models — including TII's Falcon 180B "
                    "and Groq's ultra-low-latency inference chips — to deliver Arabic-English natural "
                    "language processing at government scale. All inference runs on UAE-sovereign "
                    "infrastructure, ensuring full data residency compliance and zero cross-border "
                    "data exposure. Our routing layer dynamically selects the optimal model based on "
                    "task complexity, latency requirements, and classification level."
                ),
                "icon_class": "icon-llm",
                "order": 2,
            },
            {
                "title": "Identity & Payment Integration (UAE Pass / UAE Pay)",
                "description": (
                    "Native, production-grade integration with UAE Pass for digital identity "
                    "verification and UAE Pay for government fee processing. Citizens authenticate "
                    "once and access a unified service portal — no redundant registrations, no "
                    "friction. Our platform supports biometric verification, digital document "
                    "signing, and real-time payment reconciliation across all municipal agencies."
                ),
                "icon_class": "icon-identity",
                "order": 3,
            },
            {
                "title": "Human-in-the-Loop Supervision",
                "description": (
                    "Every autonomous decision made by ZeroGrav's AI passes through our supervision "
                    "framework. Government officers retain full authority at configurable intervention "
                    "points. The system provides explainable AI summaries, confidence scores, and "
                    "recommended actions — empowering human supervisors with AI-augmented insight "
                    "rather than replacing their judgment. Full audit trails ensure accountability "
                    "and regulatory compliance."
                ),
                "icon_class": "icon-supervision",
                "order": 4,
            },
        ]

        created_count = 0
        for cap_data in capabilities_data:
            _, created = CompanyCapability.objects.update_or_create(
                title=cap_data["title"],
                defaults=cap_data,
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"  [OK] {created_count} new capabilities created ({len(capabilities_data)} total)")
        )

        # ── Flagship Case Study ───────────────────────────────────────────
        flagship_data = {
            "title": "ZeroGrav Autonomous Civic OS — Abu Dhabi Smart City Deployment",
            "slug": "zero-grav-os",
            "client_type": "government",
            "summary": (
                "A full-stack autonomous operating system deployed for Abu Dhabi's municipal "
                "government, orchestrating citizen services, permit workflows, urban resource "
                "allocation, and inter-agency coordination across 12 government entities. "
                "The platform processes 10,000+ daily transactions with a 99.97% uptime SLA, "
                "reducing average service delivery time by 40% and eliminating 73% of manual "
                "data-entry tasks through AI-driven document processing."
            ),
            "metric_highlight": (
                "40% faster service delivery · 73% reduction in manual data entry · "
                "99.97% uptime · 10,000+ daily transactions · 12 agencies integrated"
            ),
            "project_url": "",
            "body_html": """
<div class="case-study-body">
    <h3>Challenge</h3>
    <p>
        Abu Dhabi's municipal government sought to unify fragmented citizen service
        delivery across 12 agencies, each operating on legacy systems with incompatible
        data formats and manual handoff processes. Average permit processing time
        exceeded 14 business days, with citizens required to visit multiple physical
        offices and submit redundant documentation.
    </p>

    <h3>Solution</h3>
    <p>
        ZeroGrav Systems deployed the Autonomous Civic OS — a sovereign, AI-orchestrated
        platform that connects all 12 agencies through a unified API mesh. The system
        features:
    </p>
    <ul>
        <li><strong>Autonomous Workflow Engine:</strong> AI-routed permit and service
            request pipelines with configurable human-in-the-loop gates</li>
        <li><strong>Sovereign NLP Layer:</strong> Falcon 180B-powered Arabic/English
            document processing and citizen inquiry handling</li>
        <li><strong>UAE Pass SSO:</strong> Single-authentication citizen access across
            all municipal services</li>
        <li><strong>Real-Time City Dashboard:</strong> 200+ KPI streams providing
            leadership with live operational intelligence</li>
        <li><strong>UAE Pay Integration:</strong> Unified government fee processing
            with real-time reconciliation</li>
    </ul>

    <h3>Results</h3>
    <p>
        Within 6 months of deployment, the platform achieved transformative
        outcomes across all measured KPIs:
    </p>
    <ul>
        <li>40% reduction in average service processing time (14 days → 8.4 days)</li>
        <li>73% elimination of manual data-entry tasks</li>
        <li>99.97% platform uptime (exceeding SLA target of 99.9%)</li>
        <li>Citizen satisfaction score increased from 3.2/5 to 4.6/5</li>
        <li>12 government agencies fully integrated on a single platform</li>
    </ul>

    <h3>Technology</h3>
    <p>
        Built on Python/Django with FastAPI microservices, deployed on G42/Core42
        sovereign cloud infrastructure. AI inference powered by Falcon 180B (TII)
        with Groq acceleration for latency-critical NLP tasks. Full NESA compliance
        and ADDA architecture alignment.
    </p>
</div>
""",
        }

        _, created = CaseStudy.objects.update_or_create(
            slug=flagship_data["slug"],
            defaults=flagship_data,
        )

        status = "created" if created else "updated"
        self.stdout.write(
            self.style.SUCCESS(f"  [OK] Flagship case study '{flagship_data['title']}' {status}")
        )

        self.stdout.write(self.style.SUCCESS("\n[DONE] ZeroGrav Systems company data seeded successfully."))
