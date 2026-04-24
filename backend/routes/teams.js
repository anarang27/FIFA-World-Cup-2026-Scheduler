/* ───────────────────────────────────────────────
   Teams Routes
   ─────────────────────────────────────────────── */

const router   = require('express').Router();
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');

/* ── GET /api/teams ───────────────────────────── */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('team')
            .select('team_id, team_name, country, coach, group_id, ranking, alpha_iso_2_code')
            .order('ranking', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Get teams error:', err);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

/* ── GET /api/teams/favorite — get the favorited team ── */
router.get('/favorite', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('team')
            .select('team_id')
            .eq('favorite', true)
            .limit(1);

        if (error) throw error;
        res.json(data && data.length > 0 ? { teamid: data[0].team_id } : null);
    } catch (err) {
        console.error('Get favorite error:', err);
        res.status(500).json({ error: 'Failed to fetch favorite' });
    }
});

/* ── POST /api/teams/favorite — set favorite ──── */
router.post('/favorite', requireAuth, async (req, res) => {
    try {
        const { teamid } = req.body;

        // Clear all favorites first
        await supabase
            .from('team')
            .update({ favorite: null })
            .eq('favorite', true);

        // If teamid provided, set new favorite
        if (teamid) {
            const { error } = await supabase
                .from('team')
                .update({ favorite: true })
                .eq('team_id', teamid);

            if (error) throw error;
        }

        res.json({ message: 'Favorite updated' });
    } catch (err) {
        console.error('Set favorite error:', err);
        res.status(500).json({ error: 'Failed to update favorite' });
    }
});

module.exports = router;
