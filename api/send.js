const nodemailer = require('nodemailer');

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
    const { name, from_email, to_email, subject, message, footer, use_custom } = req.body;
    
    // Validate
    if (!name || !from_email || !to_email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      return res.status(400).json({ error: 'Invalid sender email' });
    }
    if (!emailRegex.test(to_email)) {
      return res.status(400).json({ error: 'Invalid receiver email' });
    }
    
    // Build email body - COMPLETE CUSTOM
    let emailBody;
    
    if (use_custom === 'true') {
      // User provides complete custom HTML
      emailBody = message;
    } else {
      // User provides message + optional footer
      let customFooter = '';
      if (footer && footer.trim()) {
        customFooter = `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            ${footer}
          </div>
        `;
      }
      
      emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            ${message.replace(/\n/g, '<br>')}
            ${customFooter}
          </div>
        </body>
        </html>
      `;
    }
    
    // SMTP Configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'fatemaislam3380@gmail.com',
        pass: 'djrq ncxb cimp eqxo'
      }
    });
    
    // Send email - Sender shows user's name and email
    const mailOptions = {
      from: `"${name}" <${from_email}>`,
      to: to_email,
      subject: subject,
      html: emailBody
    };
    
    await transporter.sendMail(mailOptions);
    
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
