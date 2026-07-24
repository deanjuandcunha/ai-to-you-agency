/**
 * AI-->TO-->YOU Technologies — Interactive Vanilla JS Animations & Scroll Controllers
 * 
 * Includes:
 * 1. Code Terminal Typewriter Effect (Hero Section)
 * 2. IntersectionObserver Scroll Reveal Animations (.reveal-hidden -> .reveal-visible)
 * 3. Animated Metric Number Counter (Counts up from 0 to target value on scroll)
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNumberCounters();
    initTerminalTypewriter();
});

/**
 * ── 1. CODE TERMINAL TYPEWRITER EFFECT ──────────────────────────────────────
 * Simulates a live typing Python / Groq API request & JSON response in the hero code widget.
 */
function initTerminalTypewriter() {
    const container = document.getElementById('terminal-typewriter');
    if (!container) return;

    // Structured lines of code to type out
    const lines = [
        { text: "from groq import Groq", type: "import" },
        { text: "from core.models import AIChatLog", type: "import" },
        { text: "# Initialize High-Speed AI Inference Engine", type: "comment" },
        { text: "client = Groq(api_key=\"gsk_prod_...\")", type: "code" },
        { text: "response = client.chat.completions.create(", type: "code" },
        { text: "    model=\"llama-3.1-8b-instant\",", type: "code-indent" },
        { text: "    messages=[{\"role\": \"system\", \"content\": \"AI-TO-YOU\"}]", type: "code-indent" },
        { text: ")", type: "code" },
        { text: "# Output Telemetry", type: "comment" },
        { text: "{", type: "json-brace" },
        { text: "    \"status\": \"200 OK\",", type: "json-kv" },
        { text: "    \"latency_ms\": 142,", type: "json-kv" },
        { text: "    \"precision\": \"94.2%\"", type: "json-kv" },
        { text: "}", type: "json-brace" }
    ];

    container.innerHTML = ''; // Clear fallback content

    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentLineDiv = null;

    function formatLineHtml(text, type, cursorCharCount) {
        const typedPart = text.substring(0, cursorCharCount);

        if (type === 'comment') {
            return `<span class="text-slate-600">${escapeHtml(typedPart)}</span>`;
        }
        if (type === 'import') {
            return typedPart
                .replace(/\b(from|import)\b/g, '<span class="text-purple-400">$1</span>');
        }
        if (type === 'json-brace') {
            return `<span class="text-amber-400">${escapeHtml(typedPart)}</span>`;
        }
        if (type === 'json-kv') {
            return typedPart
                .replace(/(".*?"):/g, '<span class="text-slate-400">$1</span>:')
                .replace(/("200 OK"|"94.2%")/g, '<span class="text-emerald-400">$1</span>')
                .replace(/\b(142)\b/g, '<span class="text-amber-400">$1</span>');
        }
        
        // Code lines
        return typedPart
            .replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>')
            .replace(/\b(client|response|model|messages)\b/g, '<span class="text-slate-200">$1</span>');
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function typeNextChar() {
        if (currentLineIndex >= lines.length) {
            // Typing complete — leave blinking cursor at final line
            if (currentLineDiv) {
                currentLineDiv.innerHTML += '<span class="typing-cursor"></span>';
            }
            return;
        }

        const line = lines[currentLineIndex];

        if (currentCharIndex === 0) {
            currentLineDiv = document.createElement('div');
            if (line.type === 'code-indent' || line.type === 'json-kv') {
                currentLineDiv.className = 'pl-4';
            }
            container.appendChild(currentLineDiv);
        }

        currentCharIndex++;
        currentLineDiv.innerHTML = formatLineHtml(line.text, line.type, currentCharIndex) + '<span class="typing-cursor"></span>';

        if (currentCharIndex < line.text.length) {
            // Variable typing speed for realistic feel
            const speed = Math.floor(Math.random() * 20) + 15;
            setTimeout(typeNextChar, speed);
        } else {
            // Remove cursor from finished line before advancing
            currentLineDiv.innerHTML = formatLineHtml(line.text, line.type, currentCharIndex);
            currentLineIndex++;
            currentCharIndex = 0;
            setTimeout(typeNextChar, 120);
        }
    }

    // Trigger typing when hero terminal is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(typeNextChar, 300);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(container);
}

/**
 * ── 2. SCROLL OBSERVER FADE-UP ANIMATIONS ───────────────────────────────────
 * Animates elements with .reveal-hidden into .reveal-visible as they scroll into view.
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-hidden');
    if (!revealElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                
                // Support optional staggered animation delay via data-delay attribute
                const delay = el.dataset.revealDelay || 0;
                setTimeout(() => {
                    el.classList.add('reveal-visible');
                }, delay);

                observer.unobserve(el);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * ── 3. ANIMATED NUMBER COUNTERS ─────────────────────────────────────────────
 * Smoothly counts numbers up from 0 to target value when scrolled into view.
 */
function initNumberCounters() {
    const counters = document.querySelectorAll('[data-counter-target]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
    const target = parseFloat(element.dataset.counterTarget) || 0;
    const prefix = element.dataset.counterPrefix || '';
    const suffix = element.dataset.counterSuffix || '';
    const decimals = parseInt(element.dataset.counterDecimals) || 0;
    const duration = 1500; // ms
    const startTime = performance.now();

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = (easedProgress * target).toFixed(decimals);

        element.textContent = `${prefix}${currentValue}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        }
    }

    requestAnimationFrame(updateNumber);
}
