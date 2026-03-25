import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

import fs from 'fs';
import path from 'path';

const LICENSE_FILE = path.join(process.cwd(), 'data', 'licenses.json');
const COLLECTED_DIR = path.join(process.cwd(), 'data', 'collected');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    let licenses = {};
    if (fs.existsSync(LICENSE_FILE)) licenses = JSON.parse(fs.readFileSync(LICENSE_FILE));
    let totalEmails = 0, activeLicenses = 0;
    const today = new Date().toISOString().split('T')[0];
    for (const lic of Object.values(licenses)) {
      totalEmails += lic.used_count || 0;
      if (lic.expiry >= today) activeLicenses++;
    }
    let totalUsers = 0;
    if (fs.existsSync(COLLECTED_DIR)) totalUsers = fs.readdirSync(COLLECTED_DIR).length;
    return res.status(200).json({
      totalLicenses: Object.keys(licenses).length,
      activeLicenses,
      totalEmails,
      totalUsers
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed' });
  }
}
