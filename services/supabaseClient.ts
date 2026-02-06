import { createClient } from '@supabase/supabase-js';

// Logic: Use the provided Publishable Key. 
// Note: You must update the URL below to match your specific Supabase Project URL.
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_BguIjwCUVixZ4gLUHk6QBQ_Fhmy-Sml";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
