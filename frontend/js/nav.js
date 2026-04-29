/* nav.js — Shared navigation for all pages */

document.addEventListener('DOMContentLoaded', () => {
    // Highlight current page in nav
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const tabMap = {
        'home.html':      'tab-wcs',
        'team.html':      'tab-teams',
        'stadium.html':   'tab-stadium',
        'matches.html':   'tab-matches',
        'scheduler.html': 'tab-scheduler',
        'watchlist.html':  'tab-watchlist',
        'reports.html':   'tab-reports'
    };
    const activeId = tabMap[page];
    if (activeId) {
        const el = document.getElementById(activeId);
        if (el) el.classList.add('active');
    }

    // Show user info & logout in nav
    const user = API.getUser();
    const authArea = document.getElementById('auth-area');
    if (authArea && user) {
        authArea.innerHTML = `
            <span class="user-greeting">Hi, ${user.firstname || user.username}</span>
            ${user.role?.toLowerCase() === 'admin' ? '<a href="admin.html" class="nav-admin-link">Admin</a>' : ''}
            <button id="btn-logout" class="btn-logout">Logout</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', () => {
            API.clearAuth();
            window.location.href = 'index.html';
        });
    }

    // Load and display the current favorite team
    loadFavoriteDisplay();
});

// Fetch the favorite team and show it in the nav
async function loadFavoriteDisplay() {
    const favEl = document.getElementById('fav-display');
    if (!favEl || !API.isLoggedIn()) return;

    try {
        const fav = await API.get('/api/teams/favorite');
        if (fav && fav.teamid) {
            const teams = await API.get('/api/teams');
            const team = teams.find(t => t.team_id === fav.teamid);
            if (team) {
                favEl.textContent = `★ ${team.team_name}`;
            }
        }
    } catch (err) {
        // Silently fail — favorite display is non-critical
    }
}

// Helper to update the nav display text without a full refetch
function updateFavoriteDisplay(teamname) {
    const favEl = document.getElementById('fav-display');
    if (!favEl) return;
    favEl.textContent = teamname ? `★ ${teamname}` : '';
}
