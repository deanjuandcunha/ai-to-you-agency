/**
 * AI-->TO-->YOU Technologies — Agency Interactive JavaScript Engine
 * 
 * Powers:
 * 1. Groq-Powered Virtual AI Consultant Chat Drawer (/api/consultant-chat/).
 * 2. Asynchronous Contact Form AJAX submission with validation & alert handling.
 * 3. Anti-Gravity card elevation, 3D micro-interactions, and smooth scrolling.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAIConsultantDrawer();
    initContactFormAJAX();
    initAntiGravityInteractions();
});

/**
 * Global Chat Session History array for conversation context
 */
let sessionChatHistory = [];

/**
 * ── 1. EMBEDDED GROQ AI CONSULTANT CHAT DRAWER ─────────────────────────────
 */
function initAIConsultantDrawer() {
    const container = document.getElementById('ai-chat-drawer-container');
    if (!container) return;

    // Inject Glassmorphic Chat Drawer Markup into DOM
    container.innerHTML = `
        <!-- Floating FAB Button -->
        <button id="ai-fab-btn" aria-label="Open AI Consultant Chat" class="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-600 text-slate-950 font-bold shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300 group">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
            </span>
            <i class="fa-solid fa-robot text-lg group-hover:rotate-12 transition-transform"></i>
            <span class="text-xs uppercase tracking-wider hidden sm:inline">Ask AI Consultant</span>
        </button>

        <!-- Glassmorphic Chat Drawer Window -->
        <div id="ai-chat-drawer" class="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[600px] h-[80vh] glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl flex flex-col hidden transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right overflow-hidden">
            
            <!-- Header -->
            <div class="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[1.5px]">
                        <div class="w-full h-full bg-slate-950 rounded-[10.5px] flex items-center justify-center text-cyan-400 text-sm">
                            <i class="fa-solid fa-brain"></i>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-100 font-['Outfit']">AI--&gt;TO--&gt;YOU Consultant</h4>
                        <div class="flex items-center space-x-1.5 text-[10px] text-cyan-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                            <span class="font-mono">Online &bull; Real-Time</span>
                        </div>
                    </div>
                </div>

                <button id="ai-drawer-close-btn" class="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex items-center justify-center transition-colors">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <!-- Quick Action Suggestion Pills -->
            <div class="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center space-x-2 overflow-x-auto text-[11px] scrollbar-none">
                <button class="quick-prompt-pill whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 text-cyan-300 hover:bg-cyan-950 border border-cyan-500/30 transition-colors">University Chatbot</button>
                <button class="quick-prompt-pill whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 text-purple-300 hover:bg-purple-950 border border-purple-500/30 transition-colors">HR Resume Screener</button>
                <button class="quick-prompt-pill whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 text-indigo-300 hover:bg-indigo-950 border border-indigo-500/30 transition-colors">Marine Sound AI</button>
                <button class="quick-prompt-pill whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors">Tech Stack</button>
            </div>

            <!-- Chat Messages Log Container -->
            <div id="ai-chat-messages" class="flex-grow p-4 overflow-y-auto space-y-4 text-xs">
                <!-- Initial Welcome Greeting -->
                <div class="flex items-start space-x-2.5">
                    <div class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs shrink-0 mt-1">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="glass-panel p-3.5 rounded-2xl rounded-tl-none border border-slate-800 text-slate-200 leading-relaxed max-w-[85%]">
                        Welcome to <strong>AI--&gt;TO--&gt;YOU Technologies</strong>! Ask me about custom university NLP engines, HR screening algorithms, acoustic signal analysis, or reaching founder <strong>Dean Juan D'Cunha</strong>.
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <form id="ai-chat-form" class="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center space-x-2">
                <input type="text" id="ai-chat-input" placeholder="Ask AI-TO-YOU Consultant..." autocomplete="off"
                       class="flex-grow px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors">
                <button type="submit" id="ai-chat-send-btn" class="w-9 h-9 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-cyan-500/20">
                    <i class="fa-solid fa-paper-plane text-xs"></i>
                </button>
            </form>
        </div>
    `;

    const fabBtn = document.getElementById('ai-fab-btn');
    const drawer = document.getElementById('ai-chat-drawer');
    const closeBtn = document.getElementById('ai-drawer-close-btn');
    const toggleHeaderBtn = document.getElementById('toggle-ai-chat-btn');
    const heroConsultBtn = document.getElementById('hero-consult-btn');
    const chatMessages = document.getElementById('ai-chat-messages');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');

    function openDrawer() {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            drawer.classList.remove('scale-95', 'opacity-0');
            drawer.classList.add('scale-100', 'opacity-100');
            chatInput.focus();
        }, 10);
    }

    function closeDrawer() {
        drawer.classList.remove('scale-100', 'opacity-100');
        drawer.classList.add('scale-95', 'opacity-0');
        setTimeout(() => drawer.classList.add('hidden'), 300);
    }

    fabBtn?.addEventListener('click', () => {
        if (drawer.classList.contains('hidden')) openDrawer();
        else closeDrawer();
    });

    closeBtn?.addEventListener('click', closeDrawer);
    toggleHeaderBtn?.addEventListener('click', openDrawer);
    heroConsultBtn?.addEventListener('click', openDrawer);

    // Quick prompt pills handler
    document.querySelectorAll('.quick-prompt-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            chatInput.value = pill.textContent.trim();
            sendChatMessage(chatInput.value);
        });
    });

    // Form submission (Enter key or Submit button click)
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value ? chatInput.value.trim() : '';
        if (!msg) return;
        sendChatMessage(msg);
    });

    /**
     * Sends message asynchronously to Groq endpoint /api/consultant-chat/
     */
    async function sendChatMessage(messageText) {
        // 1. Instantly display user message bubble in chat drawer
        appendUserBubble(messageText);
        chatInput.value = '';

        // Add user message to session chat history
        sessionChatHistory.push({ role: 'user', content: messageText });

        // 2. Display glowing "AI-TO-YOU is typing..." indicator
        const typingIndicatorId = appendTypingIndicator();
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 3. Execute fetch POST request to /api/consultant-chat/
            const response = await fetch('/api/consultant-chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || ''
                },
                body: JSON.stringify({
                    message: messageText,
                    chat_history: sessionChatHistory
                })
            });

            const result = await response.json();

            // 4. Remove typing indicator
            removeBubble(typingIndicatorId);

            if (result.ok && result.reply) {
                const aiReply = result.reply;
                sessionChatHistory.push({ role: 'assistant', content: aiReply });
                const suggestions = result.data?.suggested_actions || [];
                appendAIBubble(aiReply, suggestions);
            } else {
                appendAIBubble("Apologies, I encountered a temporary connection glitch. Please submit your question again or contact Founder Dean Juan D'Cunha via the inquiry form.");
            }
        } catch (err) {
            removeBubble(typingIndicatorId);
            appendAIBubble("Network error. Please check your connection and try again.");
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendUserBubble(text) {
        const div = document.createElement('div');
        div.className = 'flex items-start justify-end space-x-2.5 animate-fade-in';
        div.innerHTML = `
            <div class="p-3.5 rounded-2xl rounded-tr-none bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-slate-100 leading-relaxed max-w-[85%] shadow-lg">
                ${escapeHTML(text)}
            </div>
            <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs shrink-0 mt-1">
                <i class="fa-solid fa-user"></i>
            </div>
        `;
        chatMessages.appendChild(div);
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex items-start space-x-2.5 animate-fade-in';
        div.innerHTML = `
            <div class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs shrink-0 mt-1">
                <i class="fa-solid fa-brain animate-pulse"></i>
            </div>
            <div class="glass-panel p-3.5 rounded-2xl rounded-tl-none border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span class="font-medium tracking-wide">AI-TO-YOU is typing...</span>
            </div>
        `;
        chatMessages.appendChild(div);
        return id;
    }

    function removeBubble(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function appendAIBubble(rawMarkdownText, suggestions = []) {
        const div = document.createElement('div');
        div.className = 'flex items-start space-x-2.5 animate-fade-in';

        // Markdown Formatter (Bold, Bullet Points, Newlines)
        let formatted = escapeHTML(rawMarkdownText)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/• (.*?)\n/g, '<li class="ml-4 list-disc">$1</li>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');

        let suggestionsHTML = '';
        if (suggestions && suggestions.length > 0) {
            suggestionsHTML = `
                <div class="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    ${suggestions.map(s => `<button class="ai-suggested-btn text-[10px] px-2.5 py-1 rounded-md bg-slate-900 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950 transition-colors">${escapeHTML(s)}</button>`).join('')}
                </div>
            `;
        }

        div.innerHTML = `
            <div class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs shrink-0 mt-1">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="glass-panel p-3.5 rounded-2xl rounded-tl-none border border-slate-800 text-slate-200 leading-relaxed max-w-[85%]">
                <div>${formatted}</div>
                ${suggestionsHTML}
            </div>
        `;
        chatMessages.appendChild(div);

        // Bind click event to dynamic suggestion buttons
        div.querySelectorAll('.ai-suggested-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                chatInput.value = btn.textContent;
                sendChatMessage(chatInput.value);
            });
        });
    }
}

/**
 * ── 2. ASYNCHRONOUS CONTACT FORM SUBMISSION ────────────────────────────────
 */
function initContactFormAJAX() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const alertBox = document.getElementById('contact-form-alert');
    const submitBtn = document.getElementById('contact-submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            full_name: document.getElementById('full_name').value.trim(),
            organization: document.getElementById('organization').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        submitBtn.disabled = true;
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> <span>Submitting Inquiry...</span>`;

        try {
            const response = await fetch('/api/contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || ''
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.ok) {
                alertBox.className = "p-4 rounded-xl text-sm font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 block animate-fade-in";
                alertBox.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i> ${escapeHTML(result.message)}`;
                form.reset();
            } else {
                alertBox.className = "p-4 rounded-xl text-sm font-medium bg-rose-950/80 border border-rose-500/40 text-rose-300 block animate-fade-in";
                alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-2"></i> ${escapeHTML(result.error || 'Submission failed.')}`;
            }
        } catch (err) {
            alertBox.className = "p-4 rounded-xl text-sm font-medium bg-rose-950/80 border border-rose-500/40 text-rose-300 block";
            alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-2"></i> Network error. Please check your connection.`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });
}

/**
 * ── 3. ANTI-GRAVITY UI INTERACTIONS ──────────────────────────────────────
 */
function initAntiGravityInteractions() {
    document.querySelectorAll('.glass-card-glow').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => {
        const escapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escapes[match];
    });
}
