import fs from 'fs';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.join(process.cwd(), 'data');
const LICENSE_FILE = path.join(DATA_DIR, 'licenses.json');
const COLLECTED_DIR = path.join(DATA_DIR, 'collected');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LICENSE_FILE)) {
  fs.writeFileSync(LICENSE_FILE, JSON.stringify({}));
}
if (!fs.existsSync(COLLECTED_DIR)) {
  fs.mkdirSync(COLLECTED_DIR, { recursive: true });
}

const ADMIN_PASSWORD = '##Hossain##1';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { action, password, licenseData } = req.body;
  
  // Verify password
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ============ GENERATE LICENSE ============
  if (action === 'generate') {
    try {
      const { days, max_emails, type } = licenseData;
      
      // Generate unique license key
      const part1 = Math.random().toString(36).substring(2, 8).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 8).toUpperCase();
      const licenseKey = `KEYMAIL-${part1}-${part2}`;
      
      // Calculate expiry date
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(days));
      const expiryDate = expiry.toISOString().split('T')[0];
      
      // Load existing licenses
      let licenses = {};
      try {
        const fileContent = fs.readFileSync(LICENSE_FILE, 'utf8');
        licenses = JSON.parse(fileContent);
      } catch (err) {
        licenses = {};
      }
      
      // Add new license
      licenses[licenseKey] = {
        type: type,
        created: new Date().toISOString(),
        expiry: expiryDate,
        max_emails: max_emails === 'unlimited' ? -1 : parseInt(max_emails),
        days: parseInt(days),
        used_count: 0,
        used_by: null,
        last_used: null
      };
      
      // Save to file
      fs.writeFileSync(LICENSE_FILE, JSON.stringify(licenses, null, 2));
      
      console.log('License generated:', licenseKey);
      
      return res.status(200).json({
        success: true,
        licenseKey: licenseKey,
        expiry: expiryDate,
        max_emails: max_emails,
        message: `✅ License created: ${licenseKey}`
      });
      
    } catch (error) {
      console.error('Generate error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate license: ' + error.message 
      });
    }
  }
  
  // ============ LIST LICENSES ============
  if (action === 'list') {
    try {
      let licenses = {};
      try {
        const fileContent = fs.readFileSync(LICENSE_FILE, 'utf8');
        licenses = JSON.parse(fileContent);
      } catch (err) {
        licenses = {};
      }
      return res.status(200).json({ licenses });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to load licenses' });
    }
  }
  
  // ============ DELETE LICENSE ============
  if (action === 'delete') {
    try {
      const { licenseKey } = licenseData;
      let licenses = {};
      try {
        const fileContent = fs.readFileSync(LICENSE_FILE, 'utf8');
        licenses = JSON.parse(fileContent);
      } catch (err) {
        licenses = {};
      }
      
      delete licenses[licenseKey];
      fs.writeFileSync(LICENSE_FILE, JSON.stringify(licenses, null, 2));
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete license' });
    }
  }
  
  // ============ GET COLLECTED DATA ============
  if (action === 'getData') {
    try {
      const files = fs.readdirSync(COLLECTED_DIR);
      const data = [];
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(COLLECTED_DIR, file), 'utf8');
          data.push(JSON.parse(content));
        } catch (e) {}
      }
      return res.status(200).json({ data: data.reverse() });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to load data' });
    }
  }
  
  return res.status(400).json({ error: 'Invalid action: ' + action });
}
