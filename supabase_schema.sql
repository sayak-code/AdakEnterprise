-- Run this in the Supabase SQL Editor

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE shop_info (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT,
  description_en TEXT,
  description_bn TEXT,
  price TEXT NOT NULL,
  icon TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active SMALLINT DEFAULT 1
);

CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_address TEXT,
  services_taken TEXT,
  total_amount REAL,
  amount_paid REAL,
  amount_due REAL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  entry_date TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER,
  client_name TEXT,
  client_phone TEXT,
  message TEXT,
  channel TEXT,
  status TEXT,
  sent_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE content (
  key TEXT PRIMARY KEY,
  value_en TEXT,
  value_bn TEXT
);

CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active SMALLINT DEFAULT 1
);

-- Insert Default Admin (password: AdakAdmin@2024 via bcrypt)
INSERT INTO users (username, password) VALUES 
('admin', '$2a$10$QO0T0X1I9lB7yA3C1U1WyeHqJmXl0I7oM/H729q/4J6n6kX6.8W66');

-- Insert Default Shop Info
INSERT INTO shop_info (key, value) VALUES 
('shop_name', 'Adak Enterprise – Tathya Mitra Kendra'),
('proprietor', 'Sushavan Adak'),
('address_line1', 'Near Panchayat Office'),
('address_line2', 'Kolkata, West Bengal – 700001'),
('state', 'West Bengal'),
('pincode', '700001'),
('phone', '+91 98765 43210'),
('whatsapp', '919876543210'),
('email', 'adakenterprise@gmail.com'),
('office_hours', 'Mon–Sat: 9:00 AM – 7:00 PM'),
('tagline_en', 'Government & Online Services Made Easy'),
('tagline_bn', 'সরকারি ও অনলাইন সেবাগুলি সহজ করে'),
('map_embed_url', ''),
('facebook_url', ''),
('instagram_url', '');

-- Insert Default Content
INSERT INTO content (key, value_en, value_bn) VALUES
('hero_title_en', 'Adak Enterprise – Tathya Mitra Kendra', 'অ্যাডাক এন্টারপ্রাইজ – তথ্য মিত্র কেন্দ্র'),
('hero_subtitle_en', 'Government & Online Services Made Easy', 'সরকারি ও অনলাইন সেবাগুলি সহজ করে'),
('about_intro_en', 'Adak Enterprise – Tathya Mitra Kendra is your trusted local Common Service Center.', 'আপনার বিশ্বস্ত স্থানীয় কমন সার্ভিস সেন্টার।'),
('about_mission_en', 'Our mission is to bridge the digital divide.', 'আমাদের লক্ষ্য হল ডিজিটাল বিভাজন দূর করা।'),
('home_notice_en', '', '');

-- Insert Some Default Services
INSERT INTO services (name_en, name_bn, description_en, description_bn, price, icon, category) VALUES
('Online Form Fill-Up', 'অনলাইন ফর্ম পূরণ', 'All forms', 'সকল ফর্ম', 'Starting Rs.20', 'fas fa-file-alt', 'Forms'),
('PAN Card Apply', 'প্যান কার্ড', 'New card', 'নতুন কার্ড', 'Rs.150', 'fas fa-id-card', 'ID Card');
