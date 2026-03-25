import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const TEMPLATES_FILE = path.join(process.cwd(), 'data', 'templates.json');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'templates');

// Ensure directories exist
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}
if (!fs.existsSync(TEMPLATES_FILE)) {
  const defaultTemplates = {
    business: [
      {
        id: 'business_1',
        name: 'Corporate Newsletter',
        category: 'Business',
        image: 'https://via.placeholder.com/600x300/006a4e/white?text=Corporate+Newsletter',
        title: 'Corporate Newsletter Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#006a4e,#f42a41);padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;">{{COMPANY_NAME}}</h1>
      <p style="color:white;opacity:0.9;">Corporate Newsletter</p>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#006a4e;">Hello {{NAME}},</h2>
      <p>We're excited to share our latest updates with you.</p>
      <div style="background:#f5f5f5;padding:20px;border-radius:10px;margin:20px 0;">
        <h3>Featured Article</h3>
        <p>{{MESSAGE}}</p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="{{LINK}}" style="background:#006a4e;color:white;padding:12px 30px;text-decoration:none;border-radius:30px;">Learn More →</a>
      </div>
    </div>
    <div style="background:#f5f5f5;padding:20px;text-align:center;font-size:12px;color:#666;">
      <p>{{COMPANY_NAME}} | {{ADDRESS}} | {{PHONE}}</p>
      <p><a href="{{UNSUBSCRIBE}}" style="color:#006a4e;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
        variables: ['COMPANY_NAME', 'NAME', 'MESSAGE', 'LINK', 'ADDRESS', 'PHONE', 'UNSUBSCRIBE']
      },
      {
        id: 'business_2',
        name: 'Product Launch',
        category: 'Business',
        image: 'https://via.placeholder.com/600x300/f42a41/white?text=Product+Launch',
        title: 'Product Launch Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#f42a41,#006a4e);padding:50px 20px;text-align:center;">
      <h1 style="color:white;font-size:36px;">🚀 {{PRODUCT_NAME}}</h1>
      <p style="color:white;font-size:18px;">Launching Soon!</p>
    </div>
    <div style="padding:30px;">
      <h2>Hi {{NAME}},</h2>
      <p>We're thrilled to announce the launch of {{PRODUCT_NAME}}!</p>
      <img src="{{IMAGE_URL}}" style="width:100%;border-radius:10px;margin:20px 0;">
      <p>{{DESCRIPTION}}</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="{{LAUNCH_LINK}}" style="background:#f42a41;color:white;padding:15px 40px;text-decoration:none;border-radius:50px;font-weight:bold;">Pre-Order Now →</a>
      </div>
    </div>
    <div style="background:#f5f5f5;padding:20px;text-align:center;font-size:12px;">
      <p>Follow us: {{SOCIAL_LINKS}}</p>
    </div>
  </div>
</body>
</html>`,
        variables: ['PRODUCT_NAME', 'NAME', 'IMAGE_URL', 'DESCRIPTION', 'LAUNCH_LINK', 'SOCIAL_LINKS']
      },
      {
        id: 'business_3',
        name: 'Event Invitation',
        category: 'Business',
        image: 'https://via.placeholder.com/600x300/ffd700/black?text=Event+Invitation',
        title: 'Event Invitation Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="text-align:center;padding:30px;background:#ffd700;">
      <h1 style="margin:0;">🎉 {{EVENT_NAME}}</h1>
      <p>You're Invited!</p>
    </div>
    <div style="padding:30px;">
      <h2>Dear {{NAME}},</h2>
      <p>Join us for an exclusive event on {{DATE}} at {{VENUE}}.</p>
      <div style="background:#f9f9f9;padding:20px;border-radius:10px;margin:20px 0;">
        <p><strong>Time:</strong> {{TIME}}</p>
        <p><strong>Location:</strong> {{VENUE}}</p>
        <p><strong>Dress Code:</strong> {{DRESS_CODE}}</p>
      </div>
      <div style="text-align:center;">
        <a href="{{RSVP_LINK}}" style="background:#ffd700;color:#333;padding:12px 30px;text-decoration:none;border-radius:30px;font-weight:bold;">RSVP Now</a>
      </div>
    </div>
  </div>
</body>
</html>`,
        variables: ['EVENT_NAME', 'NAME', 'DATE', 'VENUE', 'TIME', 'DRESS_CODE', 'RSVP_LINK']
      }
    ],
    marketing: [
      {
        id: 'marketing_1',
        name: 'Sale Alert',
        category: 'Marketing',
        image: 'https://via.placeholder.com/600x300/f42a41/white?text=SALE+ALERT',
        title: 'Sale Alert Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;">
  <div style="background:linear-gradient(135deg,#f42a41,#ff6b6b);padding:60px 20px;text-align:center;">
    <h1 style="color:white;font-size:48px;">🔥 {{SALE_PERCENT}}% OFF</h1>
    <p style="color:white;font-size:20px;">Limited Time Offer</p>
    <div style="margin:30px 0;">
      <a href="{{SHOP_LINK}}" style="background:white;color:#f42a41;padding:15px 40px;text-decoration:none;border-radius:50px;font-weight:bold;">Shop Now →</a>
    </div>
    <p style="color:white;">Use Code: {{COUPON_CODE}}</p>
  </div>
</body>
</html>`,
        variables: ['SALE_PERCENT', 'SHOP_LINK', 'COUPON_CODE']
      },
      {
        id: 'marketing_2',
        name: 'Welcome Email',
        category: 'Marketing',
        image: 'https://via.placeholder.com/600x300/006a4e/white?text=Welcome',
        title: 'Welcome Email Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#006a4e;padding:40px;text-align:center;">
      <h1 style="color:white;">Welcome to {{COMPANY_NAME}}!</h1>
    </div>
    <div style="padding:30px;">
      <h2>Hello {{NAME}},</h2>
      <p>Thank you for joining us! We're excited to have you on board.</p>
      <div style="background:#f5f5f5;padding:20px;margin:20px 0;">
        <p>Here's a special welcome gift for you:</p>
        <h3 style="color:#006a4e;">{{WELCOME_GIFT}}</h3>
      </div>
      <a href="{{GET_STARTED}}" style="display:inline-block;background:#006a4e;color:white;padding:12px 30px;text-decoration:none;border-radius:30px;">Get Started</a>
    </div>
  </div>
</body>
</html>`,
        variables: ['COMPANY_NAME', 'NAME', 'WELCOME_GIFT', 'GET_STARTED']
      }
    ],
    personal: [
      {
        id: 'personal_1',
        name: 'Birthday Wish',
        category: 'Personal',
        image: 'https://via.placeholder.com/600x300/ff69b4/white?text=Happy+Birthday',
        title: 'Birthday Wish Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Georgia',serif;">
  <div style="max-width:500px;margin:0 auto;padding:20px;text-align:center;">
    <h1>🎂 Happy Birthday {{NAME}}!</h1>
    <img src="{{IMAGE_URL}}" style="width:100%;border-radius:20px;margin:20px 0;">
    <p>{{MESSAGE}}</p>
    <p>With love,<br>{{FROM_NAME}}</p>
  </div>
</body>
</html>`,
        variables: ['NAME', 'IMAGE_URL', 'MESSAGE', 'FROM_NAME']
      },
      {
        id: 'personal_2',
        name: 'Thank You Note',
        category: 'Personal',
        image: 'https://via.placeholder.com/600x300/4caf50/white?text=Thank+You',
        title: 'Thank You Note Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;">
  <div style="max-width:500px;margin:0 auto;background:#f9f9f9;border-radius:20px;padding:30px;">
    <h2 style="color:#4caf50;">Thank You!</h2>
    <p>Dear {{NAME}},</p>
    <p>{{MESSAGE}}</p>
    <p>Best regards,<br>{{FROM_NAME}}</p>
  </div>
</body>
</html>`,
        variables: ['NAME', 'MESSAGE', 'FROM_NAME']
      }
    ],
    ecommerce: [
      {
        id: 'ecommerce_1',
        name: 'Order Confirmation',
        category: 'E-Commerce',
        image: 'https://via.placeholder.com/600x300/2196f3/white?text=Order+Confirmed',
        title: 'Order Confirmation Template',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#2196f3;padding:20px;text-align:center;">
      <h1 style="color:white;">Order Confirmed! ✅</h1>
    </div>
    <div style="padding:20px;">
      <p>Hello {{NAME}},</p>
      <p>Your order #{{ORDER_ID}} has been confirmed.</p>
      <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
        <p><strong>Items:</strong> {{ITEMS}}</p>
        <p><strong>Total:</strong> {{TOTAL}}</p>
        <p><strong>Shipping:</strong> {{SHIPPING_ADDRESS}}</p>
      </div>
      <a href="{{TRACK_LINK}}" style="display:inline-block;background:#2196f3;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;margin-top:20px;">Track Order</a>
    </div>
  </div>
</body>
</html>`,
        variables: ['NAME', 'ORDER_ID', 'ITEMS', 'TOTAL', 'SHIPPING_ADDRESS', 'TRACK_LINK']
      }
    ],
    custom: []
  };
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(defaultTemplates, null, 2));
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET all templates
  if (req.method === 'GET') {
    const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE));
    return res.status(200).json(templates);
  }
  
  // POST new template (with image upload)
  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Upload failed' });
      }
      
      const { name, category, title, html, variables, password } = fields;
      
      // Check admin password
      if (password !== '##Hossain##') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      let imageUrl = '';
      if (files.image && files.image.filepath) {
        const ext = path.extname(files.image.originalFilename);
        const filename = Date.now() + ext;
        const newPath = path.join(UPLOAD_DIR, filename);
        fs.renameSync(files.image.filepath, newPath);
        imageUrl = `/uploads/templates/${filename}`;
      }
      
      const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE));
      const newTemplate = {
        id: `${category}_${Date.now()}`,
        name: name[0],
        category: category[0],
        image: imageUrl,
        title: title[0],
        html: html[0],
        variables: variables ? JSON.parse(variables[0]) : [],
        custom: true
      };
      
      if (!templates[category[0]]) {
        templates[category[0]] = [];
      }
      templates[category[0]].push(newTemplate);
      
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
      
      return res.status(200).json({ success: true, template: newTemplate });
    });
    return;
  }
  
  // DELETE template
  if (req.method === 'DELETE') {
    const { category, id, password } = req.body;
    
    if (password !== '##Hossain##') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE));
    if (templates[category]) {
      templates[category] = templates[category].filter(t => t.id !== id);
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
    }
    
    return res.status(200).json({ success: true });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
