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

/* ── GET /api/teams/favorite — get user's favorite ── */
router.get('/favorite', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('userfavorite')
            .select('teamid')
            .eq('userid', req.user.userid)
            .limit(1);

        if (error) throw error;
        res.json(data && data.length > 0 ? data[0] : null);
    } catch (err) {
        console.error('Get favorite error:', err);
        res.status(500).json({ error: 'Failed to fetch favorite' });
    }
});

/* ── POST /api/teams/favorite — set favorite ──── */
router.post('/favorite', requireAuth, async (req, res) => {
    try {
        const { teamid } = req.body;
        const userid = req.user.userid;

        // Remove existing favorite
        await supabase
            .from('userfavorite')
            .delete()
            .eq('userid', userid);

        // If teamid provided, set new favorite
        if (teamid) {
            const { error } = await supabase
                .from('userfavorite')
                .insert({ userid, teamid });

            if (error) throw error;
        }

        res.json({ message: 'Favorite updated' });
    } catch (err) {
        console.error('Set favorite error:', err);
        res.status(500).json({ error: 'Failed to update favorite' });
    }
});

module.exports = router;
