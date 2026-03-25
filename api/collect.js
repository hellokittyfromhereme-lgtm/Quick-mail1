import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'collected');

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
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const filename = `${Date.now()}_${userData.trackingId}.json`;
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(userData, null, 2));
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
}
