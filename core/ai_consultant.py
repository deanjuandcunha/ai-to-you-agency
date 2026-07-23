"""
AI-->TO-->YOU (AI-TO-YOU Technologies) — Real-Time Virtual Consultant Engine

Integrates the official Groq Python SDK with llama-3.3-70b-versatile for high-speed,
authoritative inference as the official technical consultant for AI-->TO-->YOU Technologies.
"""

import os
import logging
from typing import List, Dict, Any, Optional

try:
    from groq import Groq, GroqError
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    Groq = None
    GroqError = Exception

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """
You are the official AI Technical & Sales Consultant for "AI-->TO-->YOU Technologies" (AI-TO-YOU Technologies), an elite custom AI & Software Engineering consultancy founded by AI Developer Dean Juan D'Cunha.

Company Profile & Core Capabilities:
1. Conversational AI & Enterprise NLP: Custom LLM agent orchestration, Cohere & OpenAI API integrations, semantic search engines, and web scraping pipelines. Highlight founder Dean Juan D'Cunha's track record building the MGU & MGUIF Chatbot Architecture (achieving an 88% reduction in support desk tickets).
2. AI HR & Resume Screening Systems: Automated candidate-to-job matching engines using semantic embeddings, TF-IDF parsing, automated scoring matrices, and multi-tier ranking algorithms delivering a 10x faster recruiter screening cycle.
3. Signal Analysis & Deep Learning: Acoustic wave and sensor time-series data classification models. Demonstrated expertise in marine sound wave signal filtering presented at GMU Ajman (94.2% classification accuracy).
4. Enterprise QA & Web Architecture: High-reliability Django web applications, REST APIs, OWASP security auditing, and modern responsive anti-gravity UI design.
5. Flagship B2G Case Study: ZeroGrav Civic OS — an autonomous smart-city government portal for Abu Dhabi 2027 ($4.2M estimated annual administrative savings).

Founder Profile:
- Founder: Dean Juan D'Cunha (Lead AI Engineer & Developer)
- Qualifications: Post Graduate Diploma in AI & Data Science, BTEC IT background in Dubai, UAE. Track record at MGUIF.

Tone & Instructions:
- Maintain an authoritative, professional, knowledgeable, and inviting corporate tone.
- Keep responses concise, well-structured, and formatted with clean Markdown (bold text, bullet points).
- If the user asks about pricing, quotes, or custom projects, encourage them to fill out our glassmorphic inquiry form or schedule a direct consultation with Dean Juan D me.
- Answer user queries directly and highlight our proven track record.
"""


class AIToYouConsultant:
    """
    Virtual AI Technical & Sales Consultant powered by Groq API (llama-3.3-70b-versatile).
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY") or os.environ.get("GROQ_KEY")
        self.model = "llama-3.3-70b-versatile"
        self.client = None

        if GROQ_AVAILABLE and self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
                self.client = None
        else:
            if not GROQ_AVAILABLE:
                logger.info("groq package not installed; running in fallback mode.")
            elif not self.api_key:
                logger.info("GROQ_API_KEY environment variable not set; running in fallback mode.")

    def get_response(self, user_message: str, chat_history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Communicates with the Groq API using llama-3.3-70b-versatile to generate a response.
        Handles API errors, missing keys, or connection failures gracefully with a domain-grounded fallback.

        :param user_message: The latest message from the visitor.
        :param chat_history: Optional list of previous chat messages [{"role": "user"|"assistant", "content": "..."}]
        :return: Formatted Markdown response string.
        """
        if not user_message or not user_message.strip():
            return "Hello! I am your AI-->TO-->YOU Virtual Consultant. How can I assist your enterprise today? Ask me about our custom NLP chatbots, HR screening engines, acoustic signal analysis, or tech stack."

        # If Groq client is active, attempt API call
        if self.client:
            try:
                messages = [{"role": "system", "content": SYSTEM_PROMPT.strip()}]

                # Include past chat history if provided
                if chat_history and isinstance(chat_history, list):
                    for msg in chat_history[-6:]:  # Keep last 6 messages for context window efficiency
                        role = msg.get("role")
                        content = msg.get("content")
                        if role in ["user", "assistant"] and content:
                            messages.append({"role": role, "content": content})

                messages.append({"role": "user", "content": user_message.strip()})

                completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1024,
                    top_p=0.9,
                )

                if completion.choices and len(completion.choices) > 0:
                    reply = completion.choices[0].message.content
                    if reply and reply.strip():
                        return reply.strip()

            except GroqError as ge:
                logger.error(f"Groq API Error: {ge}")
            except Exception as e:
                logger.error(f"Unexpected error calling Groq API: {e}")

        # Fallback intelligent rule engine if Groq API key is missing or encounters a network error
        return self._rule_based_fallback(user_message)

    def respond(self, query: str) -> Dict[str, Any]:
        """
        Backwards-compatible wrapper method returning a structured dictionary response.
        """
        answer_text = self.get_response(query)
        return {
            "answer": answer_text,
            "category": "Groq AI Consultant",
            "suggested_actions": ["Book Demo", "HR Screener Info", "Contact Founder"],
        }

    def _rule_based_fallback(self, query: str) -> str:
        """
        Intelligent local fallback generator grounded in Dean Juan D'Cunha's CV and company capabilities.
        """
        q = query.lower().strip()

        if any(w in q for w in ["university", "mgu", "mguf", "academic", "student", "campus"]):
            return (
                "**Conversational AI for Higher Education & Incubators**\n\n"
                "We specialize in deploying custom NLP interaction engines for academic institutions. "
                "Founder Dean Juan D'Cunha engineered the **MGU & MGUIF Chatbot Architecture** for Mahatma Gandhi University, "
                "combining Cohere/OpenAI APIs with localized web scraping pipelines to achieve an **88% reduction in routine support desk tickets**.\n\n"
                "Would you like us to customize a chatbot prototype for your institution?"
            )
        elif any(w in q for w in ["resume", "hr", "candidate", "hiring", "recruitment", "screener"]):
            return (
                "**Semantic HR Resume Screening System**\n\n"
                "Our AI HR suite transforms candidate intake through automated semantic parsing and scoring:\n"
                "• **Semantic Matching:** Goes beyond keyword matching using TF-IDF and vector embeddings to match candidates against job requirements.\n"
                "• **Automated Scoring Matrices:** Ranks applicants into prioritized tiers with custom threshold filters.\n"
                "• **Proven Impact:** Delivers a **10x faster screening cycle** for enterprise recruiters."
            )
        elif any(w in q for w in ["sound", "wave", "signal", "acoustic", "marine", "sensor", "gmu"]):
            return (
                "**Sound Waves AI — Marine Acoustic Classification**\n\n"
                "Engineered by Dean Juan D'Cunha and presented at **GMU Ajman**, our deep learning signal analysis platform handles complex sensor data:\n"
                "• **Mel-Spectrogram Processing:** Converts raw waveforms into high-resolution spectral features.\n"
                "• **Accuracy:** Achieves **94.2% classification accuracy** using PyTorch convolutional neural networks in noisy aquatic environments."
            )
        elif any(w in q for w in ["b2g", "government", "zerograv", "civic", "abu dhabi"]):
            return (
                "**ZeroGrav Civic OS — Autonomous Smart-City Government Portal**\n\n"
                "Designed as our flagship B2G case study for Abu Dhabi 2027 Vision:\n"
                "• **Autonomous Workflows:** Orchestrates multi-department municipal services with zero-trust security.\n"
                "• **Estimated Impact:** **$4.2M in annual administrative savings** with real-time operational telemetry."
            )
        elif any(w in q for w in ["dean", "founder", "bio", "who"]):
            return (
                "**Dean Juan D'Cunha — Founder & Lead AI Engineer**\n\n"
                "• **Qualifications:** Post Graduate Diploma in AI & Data Science, BTEC IT background in Dubai, UAE.\n"
                "• **Track Record:** Key AI Developer at MGUIF; built production systems for university chatbots, HR screeners, and acoustic classification models."
            )
        elif any(w in q for w in ["tech", "stack", "python", "django", "tailwind"]):
            return (
                "**Enterprise Tech Stack at AI-->TO-->YOU**\n\n"
                "• **Backend:** Python 3.x, Django 5/6, Groq SDK (Llama 3.3 70B), Django REST.\n"
                "• **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript, Anti-Gravity Glassmorphism.\n"
                "• **AI & ML:** Groq API, Cohere API, OpenAI GPT-4, PyTorch, TensorFlow, Scikit-Learn."
            )
        else:
            return (
                "Thank you for contacting **AI-->TO-->YOU Technologies**!\n\n"
                "We deliver custom Machine Learning models, Cohere & OpenAI API integrations, semantic search engines, "
                "and scalable Django web platforms. Feel free to ask any technical question or submit your project inquiry below to consult directly with Founder Dean Juan D'Cunha."
            )
