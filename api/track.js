export default async function handler(req, res) {
  // Track visitor
  try {
    await fetch(`${process.env.VERCEL_URL}/api/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        page: req.headers.referer || '/'
      })
    });
  } catch(e) {}
  
  // Return 1x1 pixel
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
}
