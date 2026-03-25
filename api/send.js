import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// License file path
const LICENSE_FILE = path.join(process.cwd(), 'data', 'licenses.json');

// Function to check license
function checkLicense(licenseKey, userEmail) {
  if (!fs.existsSync(LICENSE_FILE)) {
    return { valid: false, message: 'License system error' };
  }
  
  const licenses = JSON.parse(fs.readFileSync(LICENSE_FILE));
  
  if (!licenses[licenseKey]) {
    return { valid: false, message: '❌ Invalid license key!' };
  }
  
  const license = licenses[licenseKey];
  const today = new Date();
  const expiryDate = new Date(license.expiry);
  
  // Check expiry
  if (expiryDate < today) {
    return { valid: false, message: `❌ License expired on ${license.expiry}` };
  }
  
  // Check if already used
  if (license.used_by && license.used_by !== userEmail) {
    return { valid: false, message: '❌ License already used by another email' };
  }
  
  // Check usage limit
  if (license.used_count >= license.max_emails && license.max_emails !== -1) {
    return { valid: false, message: `❌ License limit reached (${license.max_emails} emails)` };
  }
  
  return { 
    valid: true, 
    message: `✅ License valid until ${license.expiry}`,
    license: license
  };
}

// Function to update license usage
function updateLicenseUsage(licenseKey, userEmail) {
  const licenses = JSON.parse(fs.readFileSync(LICENSE_FILE));
  
  if (!licenses[licenseKey]) return;
  
  licenses[licenseKey].used_by = userEmail;
  licenses[licenseKey].used_count = (licenses[licenseKey].used_count || 0) + 1;
  licenses[licenseKey].last_used = new Date().toISOString();
  
  fs.writeFileSync(LICENSE_FILE, JSON.stringify(licenses, null, 2));
}

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
    const { license, name, from_email, to_email, subject, message } = req.body;
    
    // Validate license first
    const licenseCheck = checkLicense(license, from_email);
    if (!licenseCheck.valid) {
      return res.status(400).json({ error: licenseCheck.message });
    }
    
    // Validate other fields
    if (!name || !from_email || !to_email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(from_email) || !emailRegex.test(to_email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    
    // Generate tracking link
    const trackingId = Math.random().toString(36).substring(2, 15);
    const trackLink = `https://${req.headers.host}/track.html?id=${trackingId}&email=${to_email}&license=${license}`;
    
    // Email body
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
    
    // Update license usage
    updateLicenseUsage(license, from_email);
    
    return res.status(200).json({ 
      success: true, 
      message: `✅ Email sent to ${to_email}`,
      remaining: licenseCheck.license.max_emails - (licenseCheck.license.used_count + 1)
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
