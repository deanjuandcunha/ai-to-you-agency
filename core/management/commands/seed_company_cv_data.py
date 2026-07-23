"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Django Management Command

Seeds the database with authentic corporate service offerings and real CV projects:
- MGU & MGUIF Chatbot Architecture
- Semantic HR Resume Screening System
- Sound Waves AI (Marine Acoustic Classification)
- ZeroGrav Civic OS (B2G Smart City Portal)
"""

from django.core.management.base import BaseCommand
from core.models import ServiceOffering, PortfolioProject


class Command(BaseCommand):
    help = "Seed database with AI-->TO-->YOU company services and real CV portfolio projects."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding AI-->TO-->YOU database entries..."))

        # Clear old entries to avoid duplicates
        ServiceOffering.objects.all().delete()
        PortfolioProject.objects.all().delete()

        # ── 1. Services Suite ──────────────────────────────────────────────────
        services_data = [
            {
                "title": "Conversational AI & Enterprise NLP",
                "description": (
                    "End-to-end custom LLM agents, Cohere & OpenAI API integrations, semantic search engines, "
                    "and automated web scraping pipelines tailored for academic institutions and enterprise platforms."
                ),
                "icon_name": "fa-comments-dollar",
                "tech_stack": "Python, Cohere API, OpenAI, LangChain, BeautifulSoup4, Django",
                "order": 1,
            },
            {
                "title": "AI HR & Resume Screening Systems",
                "description": (
                    "Intelligent candidate-to-job matching engines utilizing semantic embeddings, TF-IDF parsing, "
                    "automated scoring matrices, and multi-tier ranking algorithms to streamline talent acquisition."
                ),
                "icon_name": "fa-user-check",
                "tech_stack": "Python, Scikit-Learn, NLTK, Pandas, Semantic Matching, REST APIs",
                "order": 2,
            },
            {
                "title": "Signal Analysis & Deep Learning",
                "description": (
                    "Advanced acoustic wave and sensor time-series data classification models. Demonstrated expertise in "
                    "marine sound wave signal filtering and spectral spectrogram analysis presented at GMU Ajman."
                ),
                "icon_name": "fa-wave-square",
                "tech_stack": "TensorFlow, PyTorch, Librosa, NumPy, SciPy, Signal Processing",
                "order": 3,
            },
            {
                "title": "Enterprise QA & Web Testing",
                "description": (
                    "High-reliability web architecture auditing, security compliance reviews, end-to-end automated testing, "
                    "and technical documentation for scalable enterprise applications."
                ),
                "icon_name": "fa-shield-halved",
                "tech_stack": "Django, Selenium, PyTest, OWASP Auditing, Tailwind CSS, JavaScript",
                "order": 4,
            },
        ]

        for s in services_data:
            ServiceOffering.objects.create(**s)
            self.stdout.write(self.style.SUCCESS(f"  [+] Service Created: {s['title']}"))

        # ── 2. Featured Projects Portfolio ──────────────────────────────────────
        projects_data = [
            {
                "title": "MGU & MGUIF Chatbot Architecture",
                "category": "nlp",
                "summary": (
                    "Designed and implemented an intelligent NLP-driven user interaction chatbot engine for Mahatma Gandhi University "
                    "and MGUIF, enabling thousands of students and faculty members to query academic guidelines, research portals, "
                    "and incubator application processes instantly."
                ),
                "impact_metric": "88% Reduction in Support Desk Tickets",
                "project_url": "https://mgu.ac.in",
                "tech_used": "Python, Cohere API, OpenAI GPT-4, NLTK, Django, Web Scraping",
            },
            {
                "title": "Semantic HR Resume Screening System",
                "category": "hr",
                "summary": (
                    "Engineered a high-speed automated candidate resume parsing and job suitability scoring engine for HR enterprises. "
                    "Applies semantic similarity, key skill vector extraction, and weighted threshold filtering to rank top talent."
                ),
                "impact_metric": "10x Faster Recruiter Screening Cycle",
                "project_url": "#",
                "tech_used": "Python, Scikit-Learn, Cosine Similarity, PDF/Docx Parsers, Django REST",
            },
            {
                "title": "Sound Waves AI — Marine Acoustic Classification",
                "category": "deep_learning",
                "summary": (
                    "Deep learning research and signal processing platform engineered for marine acoustic sound wave classification. "
                    "Presented at GMU Ajman, utilizing spectrogram transform pipelines for aquatic fauna identification."
                ),
                "impact_metric": "94.2% Classification Accuracy in Noisy Marine Environments",
                "project_url": "#",
                "tech_used": "PyTorch, Librosa, Mel-Spectrogram Processing, Convolutional Neural Nets",
            },
            {
                "title": "Flagship B2G Case Study: ZeroGrav Civic OS",
                "category": "b2g",
                "summary": (
                    "Autonomous smart-city government portal engineered for Abu Dhabi 2027 Vision. Features real-time civic workflow "
                    "orchestration, multi-department telemetry integration, sovereign LLM task dispatching, and zero-trust audit trails."
                ),
                "impact_metric": "$4.2M Estimated Annual Administrative Cost Savings",
                "project_url": "#",
                "tech_used": "Django, Sovereign LLM Router, Tailwind CSS, PostgreSQL, Real-Time WebSockets",
            },
        ]

        for p in projects_data:
            PortfolioProject.objects.create(**p)
            self.stdout.write(self.style.SUCCESS(f"  [+] Project Created: {p['title']}"))

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] AI-->TO-->YOU Database successfully populated!"))
