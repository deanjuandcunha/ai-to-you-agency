/**
 * AI-->TO-->YOU Technologies — Executive Admin Dashboard JavaScript
 * 
 * Handles:
 * 1. Chart.js rendering for AI Query Volume & Inquiry Status Breakdown
 * 2. Real-time AJAX status toggle & DOM button re-rendering for Client Inquiries
 * 3. Dynamic search & client-side filtering for inquiry records and live query feed
 * 4. Toast notifications & interactive UI feedback
 */

let statusChartInstance = null;

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

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * ── 1. Chart.js Initialization
 */
function initCharts() {
    // 1. AI Query Volume Chart (Line/Area Hybrid)
    const aiCanvas = document.getElementById('aiQueryChart');
    if (aiCanvas && window.Chart) {
        const labels = JSON.parse(aiCanvas.dataset.labels || '[]');
        const data = JSON.parse(aiCanvas.dataset.values || '[]');

        const ctx = aiCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AI Queries',
                    data: data,
                    borderColor: '#f59e0b',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#f59e0b',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
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
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f59e0b',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(245, 158, 11, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false,
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Fira Code', size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Fira Code', size: 11 }, precision: 0 }
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

        statusChartInstance = new Chart(statusCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#f59e0b', // New - Amber
                        '#94a3b8', // Contacted - Muted Slate
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
 * ── 2. Real-Time Inquiry Status Event Delegation Handler
 */
function initStatusUpdateHandlers() {
    const tableBody = document.getElementById('inquiries-table-body');
    if (!tableBody) return;

    tableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.js-status-btn');
        if (!btn) return;

        e.preventDefault();

        const inquiryId = btn.dataset.inquiryId;
        const targetStatus = btn.dataset.targetStatus;
        const updateUrl = btn.dataset.updateUrl;

        if (!inquiryId || !targetStatus || !updateUrl) return;

        // Visual feedback during request
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
                const row = document.getElementById(`inquiry-row-${inquiryId}`);
                if (row) {
                    // 1. Update Status Badge
                    const badgeContainer = row.querySelector('.js-status-badge');
                    if (badgeContainer) {
                        badgeContainer.className = getStatusBadgeClasses(data.new_status);
                        badgeContainer.innerHTML = getStatusBadgeInnerHtml(data.new_status, data.status_display);
                    }

                    // 2. Re-render Quick Action Buttons
                    const actionContainer = row.querySelector('.js-action-container');
                    if (actionContainer) {
                        actionContainer.innerHTML = generateQuickActionButtonsHtml(inquiryId, data.new_status, updateUrl);
                    }
                }

                // 3. Update Top Unread Metric Card
                const unreadCard = document.getElementById('metric-unread-count');
                if (unreadCard && data.unread_count !== undefined) {
                    unreadCard.textContent = data.unread_count;
                }

                // 4. Update Doughnut Chart in real-time if chart instance exists
                if (statusChartInstance && data.status_counts) {
                    statusChartInstance.data.datasets[0].data = [
                        data.status_counts.New || 0,
                        data.status_counts.Contacted || 0,
                        data.status_counts.Closed || 0
                    ];
                    statusChartInstance.update();
                }

                showToast(`Inquiry #${inquiryId} marked as ${data.status_display}`, 'success');
            } else {
                showToast(data.error || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error('Error updating inquiry status:', err);
            showToast('Network error while updating status', 'error');
        } finally {
            if (btn && document.body.contains(btn)) {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }
    });
}

/**
 * ── Helper: Get Status Badge CSS Classes
 */
function getStatusBadgeClasses(status) {
    const base = "js-status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm transition-all ";
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
 * ── Helper: Get Status Badge Inner HTML
 */
function getStatusBadgeInnerHtml(status, statusDisplay) {
    let iconHtml = '<i class="fa-solid fa-circle text-[8px]"></i>';
    if (status === 'contacted') {
        iconHtml = '<i class="fa-solid fa-user-check text-[8px]"></i>';
    } else if (status === 'closed') {
        iconHtml = '<i class="fa-solid fa-check-double text-[8px]"></i>';
    }
    return `${iconHtml} ${statusDisplay}`;
}

/**
 * ── Helper: Dynamic HTML Generator for Action Buttons
 */
function generateQuickActionButtonsHtml(inquiryId, status, updateUrl) {
    let html = '';

    // Contacted Button
    if (status !== 'contacted') {
        html += `
            <button class="js-status-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
                    data-inquiry-id="${inquiryId}"
                    data-target-status="contacted"
                    data-update-url="${updateUrl}"
                    title="Mark as Contacted">
                <i class="fa-solid fa-paper-plane mr-1"></i> Contacted
            </button>
        `;
    }

    // Close Button
    if (status !== 'closed') {
        html += `
            <button class="js-status-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                    data-inquiry-id="${inquiryId}"
                    data-target-status="closed"
                    data-update-url="${updateUrl}"
                    title="Mark as Closed">
                <i class="fa-solid fa-check mr-1"></i> Close
            </button>
        `;
    }

    // Reset to New Button
    if (status !== 'new') {
        html += `
            <button class="js-status-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
                    data-inquiry-id="${inquiryId}"
                    data-target-status="new"
                    data-update-url="${updateUrl}"
                    title="Reset to New">
                <i class="fa-solid fa-rotate-left"></i>
            </button>
        `;
    }

    return html;
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
