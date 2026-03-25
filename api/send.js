const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { name, from_email, to_email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !from_email || !to_email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      return res.status(400).json({ error: 'Invalid sender email' });
    }
    if (!emailRegex.test(to_email)) {
      return res.status(400).json({ error: 'Invalid receiver email' });
    }
    
    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #006a4e, #f42a41); color: white; padding: 20px; text-align: center;">
            <h2>QuickMail</h2>
            <p>Made by Hossain | Made in Bangladesh 🇧🇩</p>
          </div>
          <div style="padding: 20px;">
            <h3>Message from: ${escapeHtml(name)}</h3>
            <p><strong>Email:</strong> ${escapeHtml(from_email)}</p>
            <hr>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          </div>
          <div style="background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px;">
            Sent via QuickMail
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'fatemaislam3380@gmail.com',
        pass: 'djrq ncxb cimp eqxo'
      }
    });
    
    // Send email
    const info = await transporter.sendMail({
      from: `"${name}" <${from_email}>`,
      to: to_email,
      subject: subject,
      html: emailHtml
    });
    
    console.log('Email sent:', info.messageId);
    
    return res.status(200).json({ 
      success: true, 
      message: `✅ Email sent to ${to_email}` 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to send email' 
    });
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
