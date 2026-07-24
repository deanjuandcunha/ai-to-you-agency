"""
ZeroGrav Systems — AI Sales Agent (Agent 3)

A rule-based AI spokesperson class that provides structured, on-brand responses
to prospective client and investor questions about ZeroGrav Systems.

This agent uses keyword matching and semantic intent detection to route questions
to pre-crafted, high-caliber corporate responses. In production, this can be
extended with an LLM backend (Falcon / Groq) for generative answers.
"""

import re
from datetime import datetime


class ZeroGravSalesAgent:
    """
    Corporate AI spokesperson for ZeroGrav Systems.

    Handles common prospect questions with structured, persuasive responses
    suitable for government procurement committees and enterprise partners.
    """

    COMPANY_NAME = "ZeroGrav Systems"
    FLAGSHIP_PRODUCT = "ZeroGrav Autonomous Civic OS"

    # ── Knowledge Base ────────────────────────────────────────────────────

    KNOWLEDGE_BASE = {
        "company_overview": {
            "title": "About ZeroGrav Systems",
            "content": (
                "ZeroGrav Systems is an elite B2G AI software engineering studio "
                "headquartered in Abu Dhabi, UAE. We specialize in smart-city "
                "orchestration and autonomous government architectures. Our mission "
                "is to deliver weightless, frictionless digital infrastructure that "
                "enables governments to operate at the speed of thought."
            ),
            "highlights": [
                "Founded by ex-FAANG and sovereign AI engineers",
                "Hub71 ecosystem partner",
                "Specializing in UAE government digital transformation",
                "Active security clearance for Abu Dhabi government projects",
            ],
        },
        "tech_stack": {
            "title": "Technology Stack",
            "content": (
                "Our platform is built on a modern, sovereign-first architecture "
                "designed for government-grade reliability and compliance."
            ),
            "highlights": [
                "Backend: Python 3.x, Django, FastAPI microservices",
                "AI/ML: Falcon LLM (sovereign), Groq inference acceleration",
                "Frontend: Next.js, Tailwind CSS, WebSocket real-time dashboards",
                "Infrastructure: Kubernetes on UAE sovereign cloud (G42/Core42)",
                "Identity: UAE Pass OAuth 2.0 integration",
                "Payments: UAE Pay government payment gateway",
                "Security: Zero-trust architecture, end-to-end encryption",
                "Compliance: NESA standards, Abu Dhabi Digital Authority guidelines",
            ],
        },
        "flagship_product": {
            "title": "ZeroGrav Autonomous Civic OS",
            "content": (
                "The ZeroGrav Autonomous Civic OS is our flagship platform — a "
                "full-stack autonomous operating system for city-scale government "
                "operations. It orchestrates citizen services, permit workflows, "
                "resource allocation, and inter-agency coordination through "
                "AI-driven decision pipelines with mandatory human-in-the-loop "
                "supervision at critical junctures."
            ),
            "highlights": [
                "Autonomous workflow engine processing 10,000+ daily transactions",
                "Sovereign LLM routing (Falcon 180B) for Arabic/English NLP",
                "Real-time city dashboard with 200+ KPI streams",
                "40% reduction in government service processing time",
                "99.97% uptime SLA with sovereign cloud deployment",
                "Full audit trail and explainable AI decisions",
            ],
        },
        "uae_pass": {
            "title": "UAE Pass Integration",
            "content": (
                "ZeroGrav Autonomous Civic OS natively integrates with UAE Pass — "
                "the UAE's national digital identity platform. Citizens authenticate "
                "once through UAE Pass and gain seamless access to all government "
                "services orchestrated by our platform."
            ),
            "highlights": [
                "OAuth 2.0 / OpenID Connect integration with UAE Pass",
                "Biometric verification support (face ID, fingerprint)",
                "Digital signature capabilities for government documents",
                "Single sign-on across all municipal services",
                "Compliant with Federal Authority for Identity and Citizenship standards",
            ],
        },
        "compliance": {
            "title": "Government Standards & Compliance",
            "content": (
                "ZeroGrav Systems is built from the ground up to meet and exceed "
                "UAE government regulatory requirements. Our platform aligns with "
                "Abu Dhabi's digital transformation vision and national AI strategy."
            ),
            "highlights": [
                "NESA (National Electronic Security Authority) compliant",
                "Abu Dhabi Digital Authority (ADDA) architecture guidelines",
                "UAE National AI Strategy 2031 aligned",
                "Data residency: all data stored on UAE sovereign infrastructure",
                "ISO 27001 / SOC 2 Type II certification pathway",
                "Regular third-party penetration testing and security audits",
            ],
        },
        "hub71": {
            "title": "Hub71 & Abu Dhabi Ecosystem",
            "content": (
                "ZeroGrav Systems is proud to be part of the Hub71 ecosystem — "
                "Abu Dhabi's global tech ecosystem. We leverage Hub71's unique "
                "position to connect with government entities, sovereign wealth "
                "funds, and enterprise partners across the MENA region."
            ),
            "highlights": [
                "Hub71 incentive program participant",
                "Access to Mubadala and ADQ partnership channels",
                "Co-development programs with Abu Dhabi government entities",
                "ADGM (Abu Dhabi Global Market) registered entity",
            ],
        },
        "pricing": {
            "title": "Engagement & Pricing",
            "content": (
                "ZeroGrav Systems operates on an enterprise licensing model "
                "tailored to government procurement frameworks. We offer flexible "
                "engagement models designed for long-term strategic partnerships."
            ),
            "highlights": [
                "Annual enterprise license with dedicated support",
                "Modular deployment — start with one agency, scale citywide",
                "Government procurement-friendly commercial terms",
                "Dedicated solutions architect assigned to each engagement",
                "Contact our executive team for a tailored proposal",
            ],
        },
    }

    # ── Intent Routing ────────────────────────────────────────────────────

    INTENT_PATTERNS = [
        {
            "intents": ["company", "about", "who are you", "tell me about", "what is zerograv", "overview"],
            "knowledge_key": "company_overview",
        },
        {
            "intents": ["stack", "technology", "tech", "built with", "architecture", "framework", "python", "django", "infrastructure"],
            "knowledge_key": "tech_stack",
        },
        {
            "intents": ["flagship", "product", "civic os", "autonomous os", "platform", "main product", "solution", "what do you offer"],
            "knowledge_key": "flagship_product",
        },
        {
            "intents": ["uae pass", "identity", "authentication", "sign in", "login", "biometric", "digital id"],
            "knowledge_key": "uae_pass",
        },
        {
            "intents": ["compliance", "regulation", "government standard", "nesa", "security", "audit", "iso", "certified", "compliant", "abu dhabi government"],
            "knowledge_key": "compliance",
        },
        {
            "intents": ["hub71", "abu dhabi", "ecosystem", "mubadala", "adgm", "accelerator"],
            "knowledge_key": "hub71",
        },
        {
            "intents": ["price", "pricing", "cost", "license", "commercial", "engagement", "procurement", "proposal", "quote"],
            "knowledge_key": "pricing",
        },
        {
            "intents": ["falcon", "groq", "llm", "language model", "ai model", "sovereign ai", "nlp"],
            "knowledge_key": "tech_stack",
        },
        {
            "intents": ["uae pay", "payment", "pay", "transaction", "billing"],
            "knowledge_key": "flagship_product",
        },
        {
            "intents": ["human in the loop", "supervision", "oversight", "manual review", "approval"],
            "knowledge_key": "flagship_product",
        },
    ]

    def __init__(self):
        self.conversation_history = []

    def _detect_intent(self, question: str) -> str | None:
        """Match a question to a knowledge-base key using keyword intent detection."""
        q_lower = question.lower()
        for pattern_group in self.INTENT_PATTERNS:
            for intent_phrase in pattern_group["intents"]:
                if intent_phrase in q_lower:
                    return pattern_group["knowledge_key"]
        return None

    def _format_response(self, knowledge_key: str) -> dict:
        """Format a knowledge-base entry into a structured response payload."""
        entry = self.KNOWLEDGE_BASE[knowledge_key]
        return {
            "title": entry["title"],
            "content": entry["content"],
            "highlights": entry["highlights"],
            "cta": "Would you like to schedule an executive briefing or request a detailed proposal?",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _fallback_response(self, question: str) -> dict:
        """Generate a graceful fallback when no intent is matched."""
        return {
            "title": "Let Me Connect You",
            "content": (
                f"That's a great question. While I may not have the specific details "
                f"on \"{question[:80]}\" in my current knowledge base, our executive "
                f"team would be delighted to provide a comprehensive answer. "
                f"Please use the contact form below or email us at "
                f"executive@zerograv.systems for a personalized response."
            ),
            "highlights": [
                "Email: deanjuan@ai-to-you.online",
                "Response time: within 24 business hours",
                "Request an executive briefing via the contact form",
            ],
            "cta": "Submit your question through our contact form for a detailed response from our team.",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def respond(self, question: str) -> dict:
        """
        Process a user question and return a structured corporate response.

        Args:
            question: The prospect's question text.

        Returns:
            A dict with keys: title, content, highlights, cta, timestamp.
        """
        self.conversation_history.append({
            "role": "user",
            "content": question,
            "timestamp": datetime.utcnow().isoformat(),
        })

        knowledge_key = self._detect_intent(question)

        if knowledge_key:
            response = self._format_response(knowledge_key)
        else:
            response = self._fallback_response(question)

        self.conversation_history.append({
            "role": "assistant",
            "content": response["content"],
            "timestamp": response["timestamp"],
        })

        return response
