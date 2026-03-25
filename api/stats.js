import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Get licenses count
    const { count: totalLicenses } = await supabase
      .from('licenses')
      .select('*', { count: 'exact', head: true });
    
    // Get active licenses
    const today = new Date().toISOString().split('T')[0];
    const { count: activeLicenses } = await supabase
      .from('licenses')
      .select('*', { count: 'exact', head: true })
      .gte('expiry', today);
    
    // Get total emails sent
    const { data: licenses } = await supabase
      .from('licenses')
      .select('used_count');
    
    let totalEmails = 0;
    for (const lic of licenses || []) {
      totalEmails += lic.used_count || 0;
    }
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from('collected_data')
      .select('*', { count: 'exact', head: true });
    
    return res.status(200).json({
      totalLicenses: totalLicenses || 0,
      activeLicenses: activeLicenses || 0,
      totalEmails: totalEmails,
      totalUsers: totalUsers || 0
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}
