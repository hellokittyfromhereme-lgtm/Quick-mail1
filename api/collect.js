import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const userData = req.body;
    
    const { error } = await supabase
      .from('collected_data')
      .insert({
        tracking_id: userData.trackingId,
        user_email: userData.userEmail,
        license: userData.license,
        ip: userData.ip,
        location: userData.location,
        browser: userData.browser,
        platform: userData.platform,
        timestamp: userData.timestamp || new Date().toISOString()
      });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
