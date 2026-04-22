/* ───────────────────────────────────────────────
   Supabase client — shared across all routes
   ─────────────────────────────────────────────── */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY   // service-role key for full access
);

module.exports = supabase;
