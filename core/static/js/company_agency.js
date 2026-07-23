/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ZeroGrav Systems — Corporate Agency JavaScript (Agent 3)
 *
 * Handles:
 * - AI Sales Assistant drawer & AJAX chat
 * - Contact form AJAX submission
 * - Navigation scroll effects
 * - Scroll-reveal animations
 * - Metric counter animations
 * - Floating particle effects
 * - Mobile menu
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── DOM Ready ────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initScrollReveal();
        initMetricCounters();
        initContactForm();
        initAIAssistant();
        initMobileMenu();
        initFloatingParticles();
        initActivityFeedSimulation();
    });


    // ═════════════════════════════════════════════════════════════════════
    // NAVIGATION
    // ═════════════════════════════════════════════════════════════════════

    function initNavigation() {
        const nav = document.getElementById('mainNav');
        if (!nav) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            if (scrollY > 60) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            lastScroll = scrollY;
        }, { passive: true });
    }


    // ═════════════════════════════════════════════════════════════════════
    // SCROLL REVEAL
    // ═════════════════════════════════════════════════════════════════════

    function initScrollReveal() {
        const elements = document.querySelectorAll('[data-scroll-reveal]');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        });

        elements.forEach(el => observer.observe(el));
    }


    // ═════════════════════════════════════════════════════════════════════
    // METRIC COUNTERS
    // ═════════════════════════════════════════════════════════════════════

    function initMetricCounters() {
        const metricItems = document.querySelectorAll('.metric-item');
        if (!metricItems.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add('counted');
                    const countEl = el.querySelector('[data-count]');
                    if (countEl) {
                        animateCounter(countEl);
                    }
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        metricItems.forEach(el => observer.observe(el));
    }

    function animateCounter(el) {
        const target = parseFloat(el.dataset.count);
        const isPercentage = el.textContent.includes('%');
        const isDecimal = target % 1 !== 0;
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            if (isDecimal) {
                el.textContent = current.toFixed(2) + (isPercentage ? '%' : '');
            } else {
                const formatted = Math.floor(current).toLocaleString();
                el.textContent = formatted + (isPercentage ? '%' : (target >= 1000 ? '+' : ''));
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }


    // ═════════════════════════════════════════════════════════════════════
    // CONTACT FORM (AJAX)
    // ═════════════════════════════════════════════════════════════════════

    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnText = document.getElementById('contactBtnText');
            const btnSpinner = document.getElementById('contactBtnSpinner');
            const submitBtn = document.getElementById('contactSubmitBtn');
            const responseEl = document.getElementById('contactResponse');

            // Gather data
            const data = {
                full_name: document.getElementById('contactName').value.trim(),
                organization: document.getElementById('contactOrg').value.trim(),
                email: document.getElementById('contactEmail').value.trim(),
                phone: document.getElementById('contactPhone').value.trim(),
                message: document.getElementById('contactMessage').value.trim(),
            };

            // Client-side validation
            if (!data.full_name || !data.organization || !data.email || !data.message) {
                showResponse(responseEl, 'error', 'Please fill in all required fields.');
                return;
            }

            // Show loading
            btnText.textContent = 'Submitting...';
            btnSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70');

            try {
                const res = await fetch('/api/contact/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await res.json();

                if (result.ok) {
                    showResponse(responseEl, 'success', result.message);
                    form.reset();
                } else {
                    showResponse(responseEl, 'error', result.error || 'Something went wrong.');
                }
            } catch (err) {
                showResponse(responseEl, 'error', 'Network error. Please try again.');
            } finally {
                btnText.textContent = 'Submit Inquiry';
                btnSpinner.classList.add('hidden');
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-70');
            }
        });
    }

    function showResponse(el, type, message) {
        el.textContent = message;
        el.className = `rounded-xl px-4 py-3 text-sm ${type}`;
        el.classList.remove('hidden');

        setTimeout(() => {
            el.classList.add('hidden');
        }, 6000);
    }


    // ═════════════════════════════════════════════════════════════════════
    // AI SALES ASSISTANT
    // ═════════════════════════════════════════════════════════════════════

    function initAIAssistant() {
        const toggleBtn = document.getElementById('aiToggleBtn');
        const closeBtn = document.getElementById('aiCloseBtn');
        const drawer = document.getElementById('aiDrawer');
        const input = document.getElementById('aiInput');
        const sendBtn = document.getElementById('aiSendBtn');
        const messagesContainer = document.getElementById('aiMessages');

        if (!toggleBtn || !drawer) return;

        let isOpen = false;

        // Toggle drawer
        toggleBtn.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                drawer.style.display = 'block';
                requestAnimationFrame(() => {
                    drawer.classList.add('open');
                });
            } else {
                closeDrawer();
            }
        });

        closeBtn.addEventListener('click', () => {
            isOpen = false;
            closeDrawer();
        });

        function closeDrawer() {
            drawer.classList.remove('open');
            setTimeout(() => {
                drawer.style.display = 'none';
            }, 400);
        }

        // Send message
        async function sendMessage(question) {
            if (!question.trim()) return;

            // Add user message
            appendMessage('user', question);
            input.value = '';

            // Show typing indicator
            const typingEl = appendTypingIndicator();

            try {
                const res = await fetch('/api/ai-chat/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question }),
                });

                const result = await res.json();

                // Remove typing indicator
                typingEl.remove();

                if (result.ok) {
                    appendAIResponse(result.response);
                } else {
                    appendMessage('ai', result.error || 'Sorry, I encountered an issue.');
                }
            } catch (err) {
                typingEl.remove();
                appendMessage('ai', 'Network error. Please try again.');
            }
        }

        sendBtn.addEventListener('click', () => sendMessage(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage(input.value);
        });

        // Quick action buttons
        document.querySelectorAll('.ai-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sendMessage(btn.dataset.question);
            });
        });

        function appendMessage(role, text) {
            const div = document.createElement('div');
            div.className = 'ai-msg flex gap-3';

            if (role === 'user') {
                div.innerHTML = `
                    <div class="ml-auto bg-gradient-to-r from-zg-purple/20 to-zg-cyan/20 rounded-xl rounded-tr-sm px-4 py-3 text-sm text-gray-200 leading-relaxed max-w-[85%]">
                        ${escapeHtml(text)}
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-zg-purple/30 to-zg-cyan/30 flex items-center justify-center mt-0.5">
                        <svg class="w-3.5 h-3.5 text-zg-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <div class="bg-white/5 rounded-xl rounded-tl-sm px-4 py-3 text-sm text-gray-300 leading-relaxed max-w-[85%]">
                        ${escapeHtml(text)}
                    </div>
                `;
            }

            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function appendAIResponse(response) {
            const div = document.createElement('div');
            div.className = 'ai-msg flex gap-3';

            let highlightsHtml = '';
            if (response.highlights && response.highlights.length) {
                highlightsHtml = `
                    <ul class="mt-3 space-y-1.5">
                        ${response.highlights.map(h => `
                            <li class="flex items-start gap-2 text-xs text-gray-400">
                                <span class="shrink-0 w-1 h-1 rounded-full bg-zg-cyan mt-1.5"></span>
                                <span>${escapeHtml(h)}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            }

            div.innerHTML = `
                <div class="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-zg-purple/30 to-zg-cyan/30 flex items-center justify-center mt-0.5">
                    <svg class="w-3.5 h-3.5 text-zg-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                </div>
                <div class="bg-white/5 rounded-xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed max-w-[85%]">
                    <div class="font-semibold text-zg-cyan text-xs uppercase tracking-wider mb-2">${escapeHtml(response.title)}</div>
                    <p class="text-gray-300 mb-1">${escapeHtml(response.content)}</p>
                    ${highlightsHtml}
                    ${response.cta ? `<p class="mt-3 text-xs text-zg-purple italic">${escapeHtml(response.cta)}</p>` : ''}
                </div>
            `;

            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function appendTypingIndicator() {
            const div = document.createElement('div');
            div.className = 'ai-msg flex gap-3 typing-indicator';
            div.innerHTML = `
                <div class="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-zg-purple/30 to-zg-cyan/30 flex items-center justify-center mt-0.5">
                    <svg class="w-3.5 h-3.5 text-zg-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                </div>
                <div class="bg-white/5 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-zg-cyan animate-bounce" style="animation-delay: 0s;"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-zg-cyan animate-bounce" style="animation-delay: 0.15s;"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-zg-cyan animate-bounce" style="animation-delay: 0.3s;"></div>
                </div>
            `;
            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return div;
        }
    }


    // ═════════════════════════════════════════════════════════════════════
    // MOBILE MENU
    // ═════════════════════════════════════════════════════════════════════

    function initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const menu = document.getElementById('mobileMenu');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            menu.classList.toggle('open');
        });

        // Close on link click
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                btn.classList.remove('active');
                menu.classList.remove('open');
            });
        });
    }


    // ═════════════════════════════════════════════════════════════════════
    // FLOATING PARTICLES (Anti-Gravity Effect)
    // ═════════════════════════════════════════════════════════════════════

    function initFloatingParticles() {
        const colors = [
            'rgba(6, 214, 160, 0.5)',
            'rgba(139, 92, 246, 0.5)',
            'rgba(59, 130, 246, 0.4)',
            'rgba(236, 72, 153, 0.3)',
        ];

        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';

            const size = Math.random() * 4 + 2;
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight + 20;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const duration = Math.random() * 3 + 3;

            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: ${color};
                box-shadow: 0 0 ${size * 2}px ${color};
                animation-duration: ${duration}s;
            `;

            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, duration * 1000);
        }

        // Spawn particles periodically
        setInterval(createParticle, 800);
    }


    // ═════════════════════════════════════════════════════════════════════
    // ACTIVITY FEED SIMULATION (Flagship Section)
    // ═════════════════════════════════════════════════════════════════════

    function initActivityFeedSimulation() {
        const feed = document.getElementById('activityFeed');
        if (!feed) return;

        const activities = [
            { color: 'bg-zg-cyan', text: 'Permit #AD-{id} auto-approved → Department of Urban Planning' },
            { color: 'bg-zg-purple', text: 'Falcon NLP: {conf}% confidence on document batch #{batch}' },
            { color: 'bg-zg-blue', text: 'UAE Pass SSO: {count} authentications processed this hour' },
            { color: 'bg-green-400', text: 'UAE Pay: AED {amount}M in government fees processed today' },
            { color: 'bg-yellow-400', text: 'HITL Alert: Supervisor review requested for case #AD-{id}' },
            { color: 'bg-zg-cyan', text: 'Workflow #{id} completed — 3 agency handoffs in {time}min' },
            { color: 'bg-zg-purple', text: 'Citizen satisfaction pulse: {rating}/5 (last 100 interactions)' },
            { color: 'bg-zg-blue', text: 'Infrastructure health check passed — all {nodes} nodes operational' },
        ];

        function generateActivity() {
            const template = activities[Math.floor(Math.random() * activities.length)];
            const text = template.text
                .replace('{id}', Math.floor(Math.random() * 9000 + 1000))
                .replace('{conf}', (Math.random() * 3 + 96).toFixed(1))
                .replace('{batch}', Math.floor(Math.random() * 5000 + 4000))
                .replace('{count}', Math.floor(Math.random() * 200 + 200))
                .replace('{amount}', (Math.random() * 2 + 0.5).toFixed(1))
                .replace('{time}', Math.floor(Math.random() * 10 + 2))
                .replace('{rating}', (Math.random() * 0.5 + 4.3).toFixed(1))
                .replace('{nodes}', Math.floor(Math.random() * 10 + 38));

            return { color: template.color, text };
        }

        setInterval(() => {
            const items = feed.querySelectorAll('.flex');
            if (items.length >= 5) {
                items[items.length - 1].remove();
            }

            const activity = generateActivity();
            const div = document.createElement('div');
            div.className = 'flex items-center gap-3 text-xs';
            div.style.opacity = '0';
            div.style.transform = 'translateY(-10px)';
            div.innerHTML = `
                <span class="w-1.5 h-1.5 rounded-full ${activity.color} shrink-0"></span>
                <span class="text-gray-400">${activity.text}</span>
                <span class="text-gray-600 ml-auto shrink-0">just now</span>
            `;

            feed.insertBefore(div, feed.firstChild);

            // Animate in
            requestAnimationFrame(() => {
                div.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                div.style.opacity = '1';
                div.style.transform = 'translateY(0)';
            });

            // Update timestamps
            const timestamps = feed.querySelectorAll('.text-gray-600');
            const timeLabels = ['just now', '5s ago', '15s ago', '30s ago', '1m ago'];
            timestamps.forEach((ts, i) => {
                if (i < timeLabels.length) ts.textContent = timeLabels[i];
            });
        }, 4000);
    }


    // ═════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════════

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

})();
