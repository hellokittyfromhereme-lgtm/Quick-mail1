const nodemailer = require('nodemailer');

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
    const { name, from_email, to_email, subject, message, use_html } = req.body;
    
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
    
    // Check if message contains HTML (user wants custom design)
    let emailBody;
    if (use_html === 'true' || message.includes('<') && message.includes('>')) {
      // User's own HTML - no branding added
      emailBody = message;
    } else {
      // Plain text - wrap in minimal container
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        </div>
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
    
    // Send email - Sender shows as user's name and email
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

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
