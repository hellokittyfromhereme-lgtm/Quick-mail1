import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);
const ADMIN_PASSWORD = '##Hossain##1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { action, password, licenseData } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Generate License
  if (action === 'generate') {
    try {
      const { days, max_emails, type } = licenseData;
      const part1 = Math.random().toString(36).substring(2, 8).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 8).toUpperCase();
      const licenseKey = `KEYMAIL-${part1}-${part2}`;
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(days));
      
      const { error } = await supabase
        .from('licenses')
        .insert({
          license_key: licenseKey,
          type: type,
          expiry: expiry.toISOString().split('T')[0],
          max_emails: max_emails === 'unlimited' ? -1 : parseInt(max_emails),
          days: parseInt(days),
          used_count: 0
        });
      
      if (error) throw error;
      
      return res.status(200).json({
        success: true,
        licenseKey: licenseKey,
        expiry: expiry.toISOString().split('T')[0]
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // List Licenses
  if (action === 'list') {
    try {
      const { data } = await supabase.from('licenses').select('*').order('created', { ascending: false });
      const licenses = {};
      for (const item of data) {
        licenses[item.license_key] = item;
      }
      return res.status(200).json({ licenses });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Delete License
  if (action === 'delete') {
    try {
      await supabase.from('licenses').delete().eq('license_key', licenseData.licenseKey);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Get Collected Data
  if (action === 'getData') {
    try {
      const { data } = await supabase.from('collected_data').select('*').order('timestamp', { ascending: false }).limit(100);
      return res.status(200).json({ data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(400).json({ error: 'Invalid action' });
}
