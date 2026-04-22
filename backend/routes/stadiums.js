/* ───────────────────────────────────────────────
   Stadiums (Venues) Routes
   ─────────────────────────────────────────────── */

const router   = require('express').Router();
const supabase = require('../supabase');

/* ── GET /api/stadiums ────────────────────────── */
router.get('/', async (_req, res) => {
    try {
        const { data: venues, error } = await supabase
            .from('venue')
            .select('venueid, venuename, capacity, location, cityid')
            .order('venueid', { ascending: true });

        if (error) throw error;

        // Get match counts per venue
        const { data: matches } = await supabase
            .from('match')
            .select('venueid');

        const matchCounts = {};
        if (matches) {
            matches.forEach(m => {
                matchCounts[m.venueid] = (matchCounts[m.venueid] || 0) + 1;
            });
        }

        // Get city info
        const { data: cities } = await supabase
            .from('city')
            .select('cityid, cityname, country');

        const cityMap = {};
        if (cities) {
            cities.forEach(c => { cityMap[c.cityid] = c; });
        }

        const result = venues.map(v => ({
            ...v,
            matchcount: matchCounts[v.venueid] || 0,
            cityname: cityMap[v.cityid]?.cityname || '',
            country: cityMap[v.cityid]?.country || ''
        }));

        res.json(result);
    } catch (err) {
        console.error('Get stadiums error:', err);
        res.status(500).json({ error: 'Failed to fetch stadiums' });
    }
});

module.exports = router;
