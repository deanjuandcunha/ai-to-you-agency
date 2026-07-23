/**
 * AI-->TO-->YOU Technologies — Executive Admin Dashboard JavaScript
 * 
 * Handles:
 * 1. Chart.js rendering for AI Query Volume & Inquiry Status Breakdown
 * 2. Asynchronous status toggle AJAX requests for Client Inquiries
 * 3. Dynamic search & client-side filtering for inquiry records and live query feed
 * 4. Toast notifications & interactive UI feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initStatusUpdateHandlers();
    initSearchFilters();
});

/**
 * ── Helper: Retrieve Django CSRF Token from Cookie or DOM
 */
function getCsrfToken() {
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfInput) return csrfInput.value;
    
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

/**
 * ── Helper: Show Floating Toast Notification
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('admin-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'admin-toast-container';
        container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 border ${
        isSuccess 
            ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300 shadow-cyan-500/10' 
            : 'bg-slate-900/90 border-rose-500/40 text-rose-300 shadow-rose-500/10'
    }`;
    
    const iconClass = isSuccess ? 'fa-circle-check text-cyan-400' : 'fa-circle-exclamation text-rose-400';
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} text-lg"></i>
        <span class="text-sm font-medium tracking-wide">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    });

    // Dismiss after 3.5 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * ── 1. Chart.js Initialization
 */
function initCharts() {
    // 1. AI Query Volume Chart (Bar/Area Hybrid)
    const aiCanvas = document.getElementById('aiQueryChart');
    if (aiCanvas && window.Chart) {
        const labels = JSON.parse(aiCanvas.dataset.labels || '[]');
        const data = JSON.parse(aiCanvas.dataset.values || '[]');

        const ctx = aiCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
        gradient.addColorStop(1, 'rgba(127, 0, 255, 0.05)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AI Queries',
                    data: data,
                    borderColor: '#00f2fe',
                    borderWidth: 3,
                    pointBackgroundColor: '#7f00ff',
                    pointBorderColor: '#00f2fe',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    backgroundColor: gradient,
                    tension: 0.35,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#00f2fe',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(0, 242, 254, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false,
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, precision: 0 }
                    }
                }
            }
        });
    }

    // 2. Inquiry Status Breakdown Chart (Doughnut)
    const statusCanvas = document.getElementById('inquiryCategoryChart');
    if (statusCanvas && window.Chart) {
        const labels = JSON.parse(statusCanvas.dataset.labels || '[]');
        const data = JSON.parse(statusCanvas.dataset.values || '[]');

        new Chart(statusCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#00f2fe', // New - Cyan
                        '#a855f7', // Contacted - Purple
                        '#10b981', // Closed - Emerald
                    ],
                    borderColor: '#0b0f19',
                    borderWidth: 4,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            font: { family: 'Inter', size: 12 },
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                cutout: '72%'
            }
        });
    }
}

/**
 * ── 2. Real-Time Inquiry Status AJAX Toggle Handler
 */
function initStatusUpdateHandlers() {
    document.querySelectorAll('.js-status-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const inquiryId = btn.dataset.inquiryId;
            const targetStatus = btn.dataset.targetStatus;
            const updateUrl = btn.dataset.updateUrl;

            if (!inquiryId || !targetStatus || !updateUrl) return;

            // Visual feedback on clicked button
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-xs"></i>`;
            btn.disabled = true;

            try {
                const response = await fetch(updateUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ status: targetStatus })
                });

                const data = await response.json();

                if (response.ok && data.ok) {
                    // Update badge element in the table row
                    const row = document.getElementById(`inquiry-row-${inquiryId}`);
                    if (row) {
                        const badgeContainer = row.querySelector('.js-status-badge');
                        if (badgeContainer) {
                            badgeContainer.className = getStatusBadgeClasses(data.new_status);
                            badgeContainer.textContent = data.status_display;
                        }
                    }

                    // Update Top Unread Metric Card if element exists
                    const unreadCard = document.getElementById('metric-unread-count');
                    if (unreadCard && data.unread_count !== undefined) {
                        unreadCard.textContent = data.unread_count;
                    }

                    showToast(`Inquiry #${inquiryId} updated to ${data.status_display}`, 'success');
                } else {
                    showToast(data.error || 'Failed to update status', 'error');
                }
            } catch (err) {
                console.error('Error updating inquiry status:', err);
                showToast('Network error while updating status', 'error');
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        });
    });
}

/**
 * ── Helper: Get Status Badge Styling CSS Classes
 */
function getStatusBadgeClasses(status) {
    const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm transition-all ";
    switch (status) {
        case 'new':
            return base + "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-cyan-500/10 animate-pulse";
        case 'contacted':
            return base + "bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-purple-500/10";
        case 'closed':
            return base + "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10";
        default:
            return base + "bg-slate-700/30 text-slate-400 border-slate-700/50";
    }
}

/**
 * ── 3. Quick Search & Live Filtering
 */
function initSearchFilters() {
    const searchInput = document.getElementById('admin-quick-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();

        // 1. Filter Inquiries Table Rows
        document.querySelectorAll('#inquiries-table-body tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(term)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // 2. Filter Live AI Queries Feed
        document.querySelectorAll('#ai-feed-container .ai-feed-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(term)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}
