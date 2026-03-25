import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);

import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = { api: { bodyParser: false } };

const TEMPLATES_FILE = path.join(process.cwd(), 'data', 'templates.json');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'templates');

// Ensure directories
if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
if (!fs.existsSync(TEMPLATES_FILE)) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify({
    business: [
      { id: 'business_1', name: 'Corporate Newsletter', category: 'Business', image: 'https://via.placeholder.com/600x300/006a4e/white?text=Corporate', title: 'Professional newsletter', html: '<div><h1>{{COMPANY_NAME}}</h1><p>{{MESSAGE}}</p></div>', variables: ['COMPANY_NAME', 'MESSAGE'] },
      { id: 'business_2', name: 'Product Launch', category: 'Business', image: 'https://via.placeholder.com/600x300/f42a41/white?text=Launch', title: 'New product announcement', html: '<div><h1>{{PRODUCT}}</h1><p>{{DESCRIPTION}}</p></div>', variables: ['PRODUCT', 'DESCRIPTION'] }
    ],
    marketing: [
      { id: 'marketing_1', name: 'Sale Alert', category: 'Marketing', image: 'https://via.placeholder.com/600x300/f42a41/white?text=SALE', title: 'Flash sale', html: '<div><h1>{{DISCOUNT}}% OFF</h1><p>{{MESSAGE}}</p></div>', variables: ['DISCOUNT', 'MESSAGE'] }
    ],
    personal: [
      { id: 'personal_1', name: 'Birthday Wish', category: 'Personal', image: 'https://via.placeholder.com/600x300/ff69b4/white?text=Birthday', title: 'Birthday email', html: '<div><h1>Happy Birthday {{NAME}}!</h1><img src="{{IMAGE}}"><p>{{MESSAGE}}</p></div>', variables: ['NAME', 'IMAGE', 'MESSAGE'] }
    ],
    ecommerce: [
      { id: 'ecommerce_1', name: 'Order Confirmation', category: 'E-Commerce', image: 'https://via.placeholder.com/600x300/2196f3/white?text=Order', title: 'Order confirmation', html: '<div><h1>Order #{{ORDER_ID}}</h1><p>{{ITEMS}}</p></div>', variables: ['ORDER_ID', 'ITEMS'] }
    ],
    custom: []
  }, null, 2));
}
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE));
    return res.status(200).json(templates);
  }
  
  if (req.method === 'POST') {
    const form = formidable({ uploadDir: UPLOAD_DIR, keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: 'Upload failed' });
      const { name, category, title, html, variables, password } = fields;
      if (password !== '##Hossain##1') return res.status(401).json({ error: 'Unauthorized' });
      let imageUrl = '';
      if (files.image && files.image.filepath) {
        const ext = path.extname(files.image.originalFilename);
        const filename = Date.now() + ext;
        const newPath = path.join(UPLOAD_DIR, filename);
        fs.renameSync(files.image.filepath, newPath);
        imageUrl = `/uploads/templates/${filename}`;
      }
      const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE));
      const newTemplate = { id: `${category}_${Date.now()}`, name: name[0], category: category[0], image: imageUrl || 'https://via.placeholder.com/600x300/006a4e/white?text=Template', title: title[0], html: html[0], variables: variables ? JSON.parse(variables[0]) : [], custom: true };
      if (!templates[category[0]]) templates[category[0]] = [];
      templates[category[0]].push(newTemplate);
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
      return res.status(200).json({ success: true, template: newTemplate });
    });
    return;
  }
  
  if (req.method === 'DELETE') {
    const { category, id, password } = req.body;
    if (password !== '##Hossain##1') return res.status(401).json({ error: 'Unauthorized' });
    const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE));
    if (templates[category]) templates[category] = templates[category].filter(t => t.id !== id);
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
    return res.status(200).json({ success: true });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
