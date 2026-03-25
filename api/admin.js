import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LICENSE_FILE = path.join(DATA_DIR, 'licenses.json');
const COLLECTED_DIR = path.join(DATA_DIR, 'collected');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LICENSE_FILE)) fs.writeFileSync(LICENSE_FILE, JSON.stringify({}));
if (!fs.existsSync(COLLECTED_DIR)) fs.mkdirSync(COLLECTED_DIR, { recursive: true });

const ADMIN_PASSWORD = '##Hossain##1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { action, password, licenseData } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (action === 'generate') {
    const { days, max_emails, type } = licenseData;
    const licenseKey = 'KEYMAIL-' + Math.random().toString(36).substring(2, 10).toUpperCase() + 
                       '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + parseInt(days));
    
    const licenses = JSON.parse(fs.readFileSync(LICENSE_FILE));
    licenses[licenseKey] = {
      type: type,
      created: new Date().toISOString(),
      expiry: expiry.toISOString().split('T')[0],
      max_emails: max_emails === 'unlimited' ? -1 : parseInt(max_emails),
      days: parseInt(days),
      used_count: 0,
      used_by: null,
      last_used: null
    };
    
    fs.writeFileSync(LICENSE_FILE, JSON.stringify(licenses, null, 2));
    
    return res.status(200).json({ 
      success: true, 
      licenseKey: licenseKey,
      expiry: expiry.toISOString().split('T')[0],
      max_emails: max_emails
    });
  }
  
  if (action === 'list') {
    const licenses = JSON.parse(fs.readFileSync(LICENSE_FILE));
    return res.status(200).json({ licenses });
  }
  
  if (action === 'delete') {
    const { licenseKey } = licenseData;
    const licenses = JSON.parse(fs.readFileSync(LICENSE_FILE));
    delete licenses[licenseKey];
    fs.writeFileSync(LICENSE_FILE, JSON.stringify(licenses, null, 2));
    return res.status(200).json({ success: true });
  }
  
  if (action === 'getData') {
    const files = fs.readdirSync(COLLECTED_DIR);
    const data = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(COLLECTED_DIR, file));
        data.push(JSON.parse(content));
      } catch(e) {}
    }
    return res.status(200).json({ data: data.reverse() });
  }
  
  return res.status(400).json({ error: 'Invalid action' });
}
