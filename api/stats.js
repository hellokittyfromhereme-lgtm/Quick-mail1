import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LICENSE_FILE = path.join(DATA_DIR, 'licenses.json');
const COLLECTED_DIR = path.join(DATA_DIR, 'collected');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    let licenses = {};
    if (fs.existsSync(LICENSE_FILE)) {
      licenses = JSON.parse(fs.readFileSync(LICENSE_FILE));
    }
    
    let totalEmails = 0;
    let activeLicenses = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (const lic of Object.values(licenses)) {
      totalEmails += lic.used_count || 0;
      if (lic.expiry >= today) activeLicenses++;
    }
    
    let totalUsers = 0;
    if (fs.existsSync(COLLECTED_DIR)) {
      const files = fs.readdirSync(COLLECTED_DIR);
      totalUsers = files.length;
    }
    
    return res.status(200).json({
      totalLicenses: Object.keys(licenses).length,
      activeLicenses: activeLicenses,
      totalEmails: totalEmails,
      totalUsers: totalUsers
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}
