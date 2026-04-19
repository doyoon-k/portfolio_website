// Supabase Configuration
// REPLACE WITH YOUR OWN SUPABASE PROJECT URL AND ANON KEY

const SUPABASE_URL = 'https://lwjqwqmwaqotvxzgrhei.supabase.co'; // Automatically extracted from your new anon key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3anF3cW13YXFvdHZ4emdyaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDAwOTksImV4cCI6MjA5MjExNjA5OX0.HfPlk2yYk7p-KR46POrUUHfZVtqlme6PtryYxfZ-5Lg'; // Your public anon key

// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };
