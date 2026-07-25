/**
 * AI-TO-YOU Technologies — Executive Admin Dashboard JavaScript
 * 
 * Handles:
 * 1. Chart.js rendering for AI Query Volume & Inquiry Status Breakdown
 * 2. Real-time AJAX status toggle & DOM button re-rendering for Client Inquiries
 * 3. Expandable message drawers for full client inquiry messages
 * 4. Status filter tabs (All, New, Contacted, Closed) and quick search filtering
 * 5. Toast notifications & interactive UI feedback
 */

let statusChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initStatusUpdateHandlers();
    initInquiryMessageToggles();
    initStatusFilterTabs();
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
    
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 border font-mono text-xs ${
        isSuccess 
            ? 'bg-slate-900/90 border-amber-500/40 text-amber-300 shadow-amber-500/10' 
            : 'bg-slate-900/90 border-rose-500/40 text-rose-300 shadow-rose-500/10'
    }`;
    
    const iconClass = isSuccess ? 'fa-circle-check text-amber-400' : 'fa-circle-exclamation text-rose-400';
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} text-base"></i>
        <span class="font-medium tracking-wide">${message}</span>
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
                const detailRow = document.getElementById(`msg-row-${inquiryId}`);
                
                if (row) {
                    row.dataset.status = data.new_status;
                    if (detailRow) detailRow.dataset.status = data.new_status;

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

                // 3. Update Top Unread Metric Card & Filter Count Badges
                const unreadCard = document.getElementById('metric-unread-count');
                const filterNewBadge = document.getElementById('count-filter-new');
                if (data.unread_count !== undefined) {
                    if (unreadCard) unreadCard.textContent = data.unread_count;
                    if (filterNewBadge) filterNewBadge.textContent = data.unread_count;
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
 * ── Helper: Expandable Inquiry Message Drawer Toggles
 */
function initInquiryMessageToggles() {
    const tableBody = document.getElementById('inquiries-table-body');
    if (!tableBody) return;

    tableBody.addEventListener('click', (e) => {
        // Handle trigger buttons/snippets
        const trigger = e.target.closest('.js-toggle-msg-trigger');
        if (trigger) {
            const targetId = trigger.dataset.target;
            const detailRow = document.getElementById(targetId);
            if (detailRow) {
                detailRow.classList.toggle('hidden');
            }
            return;
        }

        // Handle close drawer buttons
        const closeBtn = e.target.closest('.js-close-msg-btn');
        if (closeBtn) {
            const targetId = closeBtn.dataset.target;
            const detailRow = document.getElementById(targetId);
            if (detailRow) {
                detailRow.classList.add('hidden');
            }
        }
    });
}

/**
 * ── Helper: Status Filter Tabs (All, New, Contacted, Closed)
 */
function initStatusFilterTabs() {
    const tabs = document.querySelectorAll('.js-inquiry-filter-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const selectedStatus = tab.dataset.status;

            // Highlight active tab button
            tabs.forEach(t => {
                t.className = 'js-inquiry-filter-tab px-3 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800 transition-all';
            });
            tab.className = 'js-inquiry-filter-tab px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold transition-all';

            // Filter inquiry rows
            const mainRows = document.querySelectorAll('.inquiry-main-row');
            mainRows.forEach(row => {
                const rowStatus = row.dataset.status;
                const detailRow = document.getElementById(`msg-row-${row.id.replace('inquiry-row-', '')}`);

                if (selectedStatus === 'all' || rowStatus === selectedStatus) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                    if (detailRow) detailRow.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * ── Helper: Get Status Badge CSS Classes
 */
function getStatusBadgeClasses(status) {
    const base = "js-status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all ";
    switch (status) {
        case 'new':
            return base + "bg-amber-400/10 text-amber-400 border border-amber-400/20";
        case 'contacted':
            return base + "bg-slate-800 text-slate-300 border border-slate-700";
        case 'closed':
            return base + "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20";
        default:
            return base + "bg-slate-800 text-slate-400 border border-slate-700";
    }
}

/**
 * ── Helper: Get Status Badge Inner HTML
 */
function getStatusBadgeInnerHtml(status, statusDisplay) {
    let iconHtml = '<i class="fa-solid fa-circle text-[8px] animate-pulse"></i>';
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
    let html = `
        <button class="js-toggle-msg-trigger px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border border-amber-400/20 transition-all"
                data-target="msg-row-${inquiryId}"
                title="View Full Inquiry Message">
            <i class="fa-solid fa-envelope-open text-xs mr-1"></i> Message
        </button>
    `;

    // Contacted Button
    if (status !== 'contacted') {
        html += `
            <button class="js-status-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all"
                    data-inquiry-id="${inquiryId}"
                    data-target-status="contacted"
                    data-update-url="${updateUrl}"
                    title="Mark as Contacted">
                <i class="fa-solid fa-paper-plane mr-1 text-amber-400"></i> Contacted
            </button>
        `;
    }

    // Close Button
    if (status !== 'closed') {
        html += `
            <button class="js-status-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 border border-emerald-400/20 transition-all"
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
            <button class="js-status-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-500 hover:text-slate-200 border border-slate-800 transition-all"
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
        document.querySelectorAll('#inquiries-table-body .inquiry-main-row').forEach(row => {
            const rowId = row.id.replace('inquiry-row-', '');
            const detailRow = document.getElementById(`msg-row-${rowId}`);
            const text = (row.textContent + ' ' + (detailRow ? detailRow.textContent : '')).toLowerCase();

            if (text.includes(term)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
                if (detailRow) detailRow.classList.add('hidden');
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
