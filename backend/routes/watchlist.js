/* ───────────────────────────────────────────────
   Watchlist Routes — per-user match watchlist
   Uses itinerary / itineraryitem tables
   ─────────────────────────────────────────────── */

const router   = require('express').Router();
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

/* ── GET /api/watchlist ───────────────────────── */
router.get('/', async (req, res) => {
    try {
        let { data: its } = await supabase.from('itinerary')
            .select('itineraryid').eq('userid', req.user.userid).limit(1);
        if (!its || its.length === 0) return res.json([]);

        const iid = its[0].itineraryid;
        const { data: items, error } = await supabase.from('itineraryitem')
            .select('itineraryitemid, matchid, addeddate, notes')
            .eq('itineraryid', iid).order('addeddate', { ascending: true });
        if (error) throw error;
        if (!items || items.length === 0) return res.json([]);

        const mids = items.map(i => i.matchid);
        const { data: matches } = await supabase.from('match')
            .select('matchid, team1id, team2id, venueid, matchdate, matchtime').in('matchid', mids);
        const { data: teams } = await supabase.from('team').select('team_id, team_name');
        const { data: venues } = await supabase.from('venue').select('venueid, venuename, location');

        const tm = {}; if (teams) teams.forEach(t => tm[t.team_id] = t.team_name);
        const vm = {}; if (venues) venues.forEach(v => vm[v.venueid] = v);
        const mm = {}; if (matches) matches.forEach(m => mm[m.matchid] = m);

        res.json(items.map(item => {
            const m = mm[item.matchid] || {};
            return {
                itineraryitemid: item.itineraryitemid,
                matchid: item.matchid, addeddate: item.addeddate, notes: item.notes,
                team1name: tm[m.team1id] || `Team ${m.team1id}`,
                team2name: tm[m.team2id] || `Team ${m.team2id}`,
                venuename: vm[m.venueid]?.venuename || '',
                venuelocation: vm[m.venueid]?.location || '',
                matchdate: m.matchdate, matchtime: m.matchtime
            };
        }));
    } catch (err) { console.error('Get watchlist error:', err); res.status(500).json({ error: 'Failed to fetch watchlist' }); }
});

/* ── POST /api/watchlist ──────────────────────── */
router.post('/', async (req, res) => {
    try {
        const { matchid, notes } = req.body;
        if (!matchid) return res.status(400).json({ error: 'matchid is required' });

        let { data: its } = await supabase.from('itinerary')
            .select('itineraryid').eq('userid', req.user.userid).limit(1);
        let iid;
        if (!its || its.length === 0) {
            const { data: nit, error: ie } = await supabase.from('itinerary').insert({
                userid: req.user.userid,
                createddate: new Date().toISOString().split('T')[0],
                lastmodified: new Date().toISOString(),
                description: 'My World Cup Watchlist'
            }).select('itineraryid').single();
            if (ie) throw ie;
            iid = nit.itineraryid;
        } else { iid = its[0].itineraryid; }

        const { data: ex } = await supabase.from('itineraryitem')
            .select('itineraryitemid').eq('itineraryid', iid).eq('matchid', matchid).limit(1);
        if (ex && ex.length > 0) return res.status(409).json({ error: 'Match already in watchlist' });

        const { error } = await supabase.from('itineraryitem').insert({
            itineraryid: iid, matchid, addeddate: new Date().toISOString().split('T')[0], notes: notes || null
        });
        if (error) throw error;
        await supabase.from('itinerary').update({ lastmodified: new Date().toISOString() }).eq('itineraryid', iid);
        res.status(201).json({ message: 'Added to watchlist' });
    } catch (err) { console.error('Add watchlist error:', err); res.status(500).json({ error: 'Failed to add to watchlist' }); }
});

/* ── DELETE /api/watchlist/:itemid ────────────── */
router.delete('/:itemid', async (req, res) => {
    try {
        const { data: its } = await supabase.from('itinerary')
            .select('itineraryid').eq('userid', req.user.userid).limit(1);
        if (!its || its.length === 0) return res.status(404).json({ error: 'Not found' });
        const { error } = await supabase.from('itineraryitem').delete()
            .eq('itineraryitemid', req.params.itemid).eq('itineraryid', its[0].itineraryid);
        if (error) throw error;
        res.json({ message: 'Removed from watchlist' });
    } catch (err) { console.error('Remove watchlist error:', err); res.status(500).json({ error: 'Failed to remove' }); }
});

module.exports = router;
