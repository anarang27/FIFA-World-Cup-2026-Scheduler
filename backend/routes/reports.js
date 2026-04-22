/* ───────────────────────────────────────────────
   Reports Routes — aggregation / grouping queries
   ─────────────────────────────────────────────── */

const router   = require('express').Router();
const supabase = require('../supabase');

/* ── GET /api/reports/matches-by-stage ─────────── */
router.get('/matches-by-stage', async (_req, res) => {
    try {
        const { data: matches } = await supabase.from('match').select('stageid');
        const { data: stages } = await supabase.from('tournamentstage').select('stageid, stagename');
        const stageMap = {}; if (stages) stages.forEach(s => stageMap[s.stageid] = s.stagename);
        const counts = {};
        if (matches) matches.forEach(m => { const n = stageMap[m.stageid] || `Stage ${m.stageid}`; counts[n] = (counts[n] || 0) + 1; });
        res.json(Object.entries(counts).map(([stage, count]) => ({ stage, count })));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});

/* ── GET /api/reports/matches-by-venue ─────────── */
router.get('/matches-by-venue', async (_req, res) => {
    try {
        const { data: matches } = await supabase.from('match').select('venueid');
        const { data: venues } = await supabase.from('venue').select('venueid, venuename');
        const vm = {}; if (venues) venues.forEach(v => vm[v.venueid] = v.venuename);
        const counts = {};
        if (matches) matches.forEach(m => { const n = vm[m.venueid] || `Venue ${m.venueid}`; counts[n] = (counts[n] || 0) + 1; });
        res.json(Object.entries(counts).map(([venue, count]) => ({ venue, count })).sort((a,b) => b.count - a.count));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});

/* ── GET /api/reports/matches-by-date ──────────── */
router.get('/matches-by-date', async (_req, res) => {
    try {
        const { data: matches } = await supabase.from('match').select('matchdate').order('matchdate');
        const counts = {};
        if (matches) matches.forEach(m => { counts[m.matchdate] = (counts[m.matchdate] || 0) + 1; });
        res.json(Object.entries(counts).map(([date, count]) => ({ date, count })));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});

/* ── GET /api/reports/teams-by-group ──────────── */
router.get('/teams-by-group', async (_req, res) => {
    try {
        const { data: teams } = await supabase.from('team').select('team_name, group_id, ranking');
        const { data: groups } = await supabase.from('Group').select('groupid, groupname');
        const gm = {}; if (groups) groups.forEach(g => gm[g.groupid] = g.groupname);
        const grouped = {};
        if (teams) teams.forEach(t => {
            const gn = gm[t.group_id] || `Group ${t.group_id}`;
            if (!grouped[gn]) grouped[gn] = [];
            grouped[gn].push({ team_name: t.team_name, ranking: t.ranking });
        });
        res.json(grouped);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});

/* ── GET /api/reports/venue-capacity ─────────── */
router.get('/venue-capacity', async (_req, res) => {
    try {
        const { data, error } = await supabase.from('venue')
            .select('venuename, capacity').order('capacity', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
