import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dibssmtdcishobpdvftg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnNzbXRkY2lzaG9icGR2ZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ4OTgsImV4cCI6MjA5MDAwMDg5OH0.lkXURp2-BjAd1AAsR78Vpfpeps0pUYCUz_JnQbmoJRc';

const supabase = createClient(supabaseUrl, supabaseKey);
const ADMIN_PASSWORD = '##Hossain##1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // GET all templates
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created', { ascending: false });
      
      if (error) throw error;
      
      const grouped = {
        business: [],
        marketing: [],
        personal: [],
        ecommerce: [],
        custom: []
      };
      
      for (const t of data) {
        if (grouped[t.category]) {
          grouped[t.category].push({
            id: t.template_id,
            name: t.name,
            category: t.category,
            image: t.image,
            title: t.title,
            html: t.html,
            variables: t.variables || [],
            custom: t.is_custom
          });
        }
      }
      
      return res.status(200).json(grouped);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST new template
  if (req.method === 'POST') {
    try {
      const { name, category, title, html, variables, password, image } = req.body;
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const templateId = `${category}_${Date.now()}`;
      const templateImage = image || 'https://placehold.co/600x300/006a4e/white?text=Template';
      
      const { error } = await supabase
        .from('templates')
        .insert({
          template_id: templateId,
          name: name,
          category: category,
          image: templateImage,
          title: title,
          html: html,
          variables: variables || [],
          is_custom: true
        });
      
      if (error) throw error;
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // DELETE template
  if (req.method === 'DELETE') {
    try {
      const { id, password } = req.body;
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('template_id', id);
      
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
