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
    const { name, from_email, to_email, subject, html_content } = req.body;
    
    // Validate
    if (!name || !from_email || !to_email || !subject || !html_content) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      return res.status(400).json({ error: 'Invalid sender email' });
    }
    if (!emailRegex.test(to_email)) {
      return res.status(400).json({ error: 'Invalid receiver email' });
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
    
    // Send email - NO BRANDING, just user's custom HTML
    const mailOptions = {
      from: `"${name}" <${from_email}>`,
      to: to_email,
      subject: subject,
      html: html_content  // User's complete custom HTML
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
