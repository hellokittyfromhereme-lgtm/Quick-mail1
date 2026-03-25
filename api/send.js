import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Supabase Configuration
const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
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
    const { license, name, from_email, to_email, subject, message } = req.body;
    
    // ============ CHECK LICENSE FROM SUPABASE ============
    const { data: licenseData, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', license)
      .single();
    
    if (licenseError || !licenseData) {
      console.error('License check error:', licenseError);
      return res.status(400).json({ error: '❌ Invalid license key!' });
    }
    
    // Check expiry
    const today = new Date().toISOString().split('T')[0];
    if (licenseData.expiry < today) {
      return res.status(400).json({ error: `❌ License expired on ${licenseData.expiry}` });
    }
    
    // Check usage limit
    if (licenseData.max_emails !== -1 && licenseData.used_count >= licenseData.max_emails) {
      return res.status(400).json({ error: `❌ License limit reached (${licenseData.max_emails} emails)` });
    }
    
    // ============ VALIDATE FORM FIELDS ============
    if (!name || !from_email || !to_email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(from_email) || !emailRegex.test(to_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // ============ GENERATE TRACKING LINK ============
    const trackingId = Math.random().toString(36).substring(2, 15);
    const trackLink = `https://${req.headers.host}/track.html?id=${trackingId}&email=${to_email}&license=${license}`;
    
    // ============ EMAIL BODY ============
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto;">
          <h2 style="color: #006a4e;">${message.substring(0, 50)}</h2>
          <p>${message}</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${trackLink}" 
               style="background: linear-gradient(135deg, #006a4e, #f42a41); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 30px;
                      display: inline-block;">
              📊 Click to Verify
            </a>
          </div>
          <hr>
          <p style="font-size: 12px; color: #888;">License: ${license}</p>
        </div>
      </body>
      </html>
    `;
    
    // ============ SEND EMAIL VIA SMTP ============
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
      from: `"${name}" <${from_email}>`,
      to: to_email,
      subject: subject,
      html: emailBody
    });
    
    // ============ UPDATE LICENSE USAGE IN SUPABASE ============
    const newUsedCount = (licenseData.used_count || 0) + 1;
    const { error: updateError } = await supabase
      .from('licenses')
      .update({
        used_count: newUsedCount,
        used_by: from_email,
        last_used: new Date().toISOString()
      })
      .eq('license_key', license);
    
    if (updateError) {
      console.error('Update error:', updateError);
    }
    
    const remaining = licenseData.max_emails === -1 ? 'Unlimited' : (licenseData.max_emails - newUsedCount);
    
    return res.status(200).json({ 
      success: true, 
      message: `✅ Email sent to ${to_email}`,
      remaining: remaining
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
