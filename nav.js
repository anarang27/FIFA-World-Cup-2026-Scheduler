/* nav.js — Shared navigation for all pages */

document.addEventListener('DOMContentLoaded', () => {
    // Map each tab ID to its target page
    const routes = {
        'tab-wcs':       'home.html',
        'tab-teams':     'team.html',
        'tab-stadium':   '#',
        'tab-matches':   '#',
        'tab-scheduler': 'scheduler.html',
        'tab-watchlist': 'watchlist.html'
    };

    // Attach click handlers to every nav element
    Object.entries(routes).forEach(([id, page]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                if (page !== '#') {
                    e.preventDefault();
                    window.location.href = page;
                }
            });
        }
    });

    // Load and display the current favorite team in the nav bar
    loadFavoriteDisplay();
});

// Fetch the favorite team from Supabase and show it in the nav
async function loadFavoriteDisplay() {
    const favEl = document.getElementById('fav-display');
    if (!favEl) return;

    // config.js must be loaded before nav.js
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team?favorite=eq.true&select=teamname&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data.length > 0 && data[0].teamname) {
            favEl.textContent = `Favorite Team: ${data[0].teamname}`;
        } else {
            favEl.textContent = '';
        }
    } catch (err) {
        console.error('Error loading favorite display:', err);
    }
}

// Helper to update the nav display text without a full refetch
function updateFavoriteDisplay(teamname) {
    const favEl = document.getElementById('fav-display');
    if (!favEl) return;

    if (teamname) {
        favEl.textContent = `Favorite Team: ${teamname}`;
    } else {
        favEl.textContent = '';
    }
}
