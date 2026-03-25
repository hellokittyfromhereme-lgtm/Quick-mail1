import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
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
    
    console.log('Received data:', userData);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('collected_data')
      .insert({
        tracking_id: userData.trackingId || null,
        user_email: userData.userEmail || null,
        license: userData.license || null,
        ip: userData.ip || null,
        location: userData.location || null,
        browser: userData.browser || null,
        platform: userData.platform || null,
        timestamp: userData.timestamp || new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error
      });
    }
    
    console.log('Data saved successfully:', data);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Data collected successfully',
      data: data
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
