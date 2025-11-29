// Supabase Configuration
// REPLACE WITH YOUR OWN SUPABASE PROJECT URL AND ANON KEY

const SUPABASE_URL = 'https://ezlnflzzugnrzvxajmic.supabase.co'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bG5mbHp6dWducnp2eGFqbWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTg3NjAsImV4cCI6MjA3OTk5NDc2MH0.n2fTmLa9CnC-iKfYHuoMoqcY39cK_lqAbnPzFVJF_94'; // Your public anon key

// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };
