/* ───────────────────────────────────────────────
   Matches Routes
   ─────────────────────────────────────────────── */

const router   = require('express').Router();
const supabase = require('../supabase');

/* ── GET /api/matches ─────────────────────────── */
router.get('/', async (req, res) => {
    try {
        // Build query — fetch matches with all related data
        let query = supabase
            .from('match')
            .select(`
                matchid,
                team1id,
                team2id,
                venueid,
                stageid,
                matchdate,
                matchtime,
                team1:team!match_team1id_fkey(team_name, country, alpha_iso_2_code),
                team2:team!match_team2id_fkey(team_name, country, alpha_iso_2_code),
                venue(venueid, venuename, location, capacity),
                tournamentstage(stagename)
            `)
            .order('matchdate', { ascending: true })
            .order('matchtime', { ascending: true });

        // Optional filters
        if (req.query.stageid) {
            query = query.eq('stageid', req.query.stageid);
        }
        if (req.query.team) {
            query = query.or(`team1id.eq.${req.query.team},team2id.eq.${req.query.team}`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Flatten the response for easier frontend consumption
        const matches = data.map(m => ({
            matchid: m.matchid,
            team1id: m.team1id,
            team2id: m.team2id,
            team1name: m.team1?.team_name || `Team ${m.team1id}`,
            team2name: m.team2?.team_name || `Team ${m.team2id}`,
            team1country: m.team1?.country || '',
            team2country: m.team2?.country || '',
            team1code: m.team1?.alpha_iso_2_code || '',
            team2code: m.team2?.alpha_iso_2_code || '',
            venueid: m.venueid,
            venuename: m.venue?.venuename || '',
            venuelocation: m.venue?.location || '',
            venuecapacity: m.venue?.capacity || 0,
            stageid: m.stageid,
            stagename: m.tournamentstage?.stagename || '',
            matchdate: m.matchdate,
            matchtime: m.matchtime
        }));

        res.json(matches);
    } catch (err) {
        console.error('Get matches error:', err);
        // Fallback: try without foreign key joins
        try {
            const { data, error } = await supabase
                .from('match')
                .select('*')
                .order('matchdate', { ascending: true })
                .order('matchtime', { ascending: true });

            if (error) throw error;
            res.json(data);
        } catch (err2) {
            console.error('Fallback matches error:', err2);
            res.status(500).json({ error: 'Failed to fetch matches' });
        }
    }
});

/* ── GET /api/matches/stages ──────────────────── */
router.get('/stages', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('tournamentstage')
            .select('*')
            .order('stageid', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Get stages error:', err);
        res.status(500).json({ error: 'Failed to fetch stages' });
    }
});

/* ── GET /api/matches/groups ──────────────────── */
router.get('/groups', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('Group')
            .select('*')
            .order('groupid', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Get groups error:', err);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

module.exports = router;
