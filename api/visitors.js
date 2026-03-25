import fs from 'fs';
import path from 'path';

const VISITOR_FILE = path.join(process.cwd(), 'data', 'visitors.json');

// Initialize visitor file
if (!fs.existsSync(VISITOR_FILE)) {
  fs.writeFileSync(VISITOR_FILE, JSON.stringify({ visits: [], online: {} }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Track visitor
  if (req.method === 'POST') {
    const { ip, location, page } = req.body;
    const data = JSON.parse(fs.readFileSync(VISITOR_FILE));
    
    // Add visit
    data.visits.push({
      time: new Date().toISOString(),
      ip: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      location: location || 'Unknown',
      page: page || '/'
    });
    
    // Update online status (5 minute window)
    const now = Date.now();
    data.online[ip] = now;
    
    // Clean old online (older than 5 minutes)
    for (const [key, time] of Object.entries(data.online)) {
      if (now - time > 5 * 60 * 1000) {
        delete data.online[key];
      }
    }
    
    fs.writeFileSync(VISITOR_FILE, JSON.stringify(data, null, 2));
    return res.status(200).json({ success: true });
  }
  
  // Get visitor stats
  if (req.method === 'GET') {
    const data = JSON.parse(fs.readFileSync(VISITOR_FILE));
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    
    let todayCount = 0, weekCount = 0, monthCount = 0;
    const recent = [];
    
    for (const visit of data.visits.slice(-100)) {
      const visitDate = visit.time.split('T')[0];
      if (visitDate === today) todayCount++;
      if (visit.time >= weekAgo) weekCount++;
      if (visit.time >= monthAgo) monthCount++;
      recent.unshift(visit);
    }
    
    return res.status(200).json({
      today: todayCount,
      week: weekCount,
      month: monthCount,
      total: data.visits.length,
      online: Object.keys(data.online).length,
      recent: recent.slice(-30).reverse()
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
