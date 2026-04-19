const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'adak_enterprise.json');

let db = {
  users: [],
  shop_info: [],
  services: [],
  sales: [],
  notifications: [],
  content: [],
  banners: [],
  _autoId: 1
};

if (fs.existsSync(DB_PATH)) {
  try { db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (e) {}
} else {
  seedIfEmpty();
  save();
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function genId() { return db._autoId++; }

function seedIfEmpty() {
  // Admin user
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'AdakAdmin@2024', 10);
  db.users.push({ id: genId(), username: 'admin', password: hash });

  // Shop info
  const shopInfoDefaults = [
    ['shop_name', 'Adak Enterprise – Tathya Mitra Kendra'],
    ['proprietor', 'Sushavan Adak'],
    ['address_line1', 'Near Panchayat Office'],
    ['address_line2', 'Kolkata, West Bengal – 700001'],
    ['state', 'West Bengal'],
    ['pincode', '700001'],
    ['phone', '+91 98765 43210'],
    ['whatsapp', '919876543210'],
    ['email', 'adakenterprise@gmail.com'],
    ['office_hours', 'Mon–Sat: 9:00 AM – 7:00 PM'],
    ['tagline_en', 'Government & Online Services Made Easy'],
    ['tagline_bn', 'সরকারি ও অনলাইন সেবাগুলি সহজ করে'],
    ['map_embed_url', ''],
    ['facebook_url', ''],
    ['instagram_url', '']
  ];
  shopInfoDefaults.forEach(([k, v]) => db.shop_info.push({ key: k, value: v }));

  // Default services
  const services = [
    { name_en: 'Online Form Fill-Up', name_bn: 'অনলাইন ফর্ম পূরণ', desc_en: 'Government and private online form filling assistance for all applications.', desc_bn: 'সরকারি ও বেসরকারি অনলাইন ফর্ম পূরণে সহায়তা।', price: 'Starting ₹20', icon: 'fas fa-file-alt', cat: 'Forms' },
    { name_en: 'Photo Print & Xerox', name_bn: 'ফটো প্রিন্ট ও জেরক্স', desc_en: 'Passport size photo prints, black & white and colour photocopies, document printouts.', desc_bn: 'পাসপোর্ট সাইজ ফটো প্রিন্ট, সাদা-কালো ও রঙিন ফটোকপি, ডকুমেন্ট প্রিন্টআউট।', price: '₹2 – ₹20 per page', icon: 'fas fa-print', cat: 'Print' },
    { name_en: 'Porcha / Certificate Download', name_bn: 'পর্চা / সার্টিফিকেট ডাউনলোড', desc_en: 'Download Porcha (land records), Cast Certificate, Income Certificate and other government certificates.', desc_bn: 'পর্চা (জমির নথি), জাতি সার্টিফিকেট, আয় সার্টিফিকেট ও অন্যান্য সরকারি সার্টিফিকেট ডাউনলোড।', price: 'Starting ₹30', icon: 'fas fa-certificate', cat: 'Certificate' },
    { name_en: 'PAN Card Apply & Correction', name_bn: 'প্যান কার্ড আবেদন ও সংশোধন', desc_en: 'New PAN card application, PAN correction, and reprint services.', desc_bn: 'নতুন প্যান কার্ডের আবেদন, প্যান সংশোধন ও পুনর্মুদ্রণ সেবা।', price: 'Starting ₹100', icon: 'fas fa-id-card', cat: 'ID Card' },
    { name_en: 'Voter Card Services', name_bn: 'ভোটার কার্ড সেবা', desc_en: 'Voter card correction, name addition, address change, and new voter registration.', desc_bn: 'ভোটার কার্ড সংশোধন, নাম যোগ, ঠিকানা পরিবর্তন ও নতুন ভোটার নিবন্ধন।', price: 'Starting ₹50', icon: 'fas fa-vote-yea', cat: 'ID Card' },
    { name_en: 'Aadhaar Services', name_bn: 'আধার সেবা', desc_en: 'Aadhaar enrollment, correction, mobile linking, address update, and download.', desc_bn: 'আধার নথিভুক্তি, সংশোধন, মোবাইল লিংকিং, ঠিকানা আপডেট ও ডাউনলোড।', price: 'Starting ₹30', icon: 'fas fa-fingerprint', cat: 'ID Card' },
    { name_en: 'Bill Payment', name_bn: 'বিল পেমেন্ট', desc_en: 'Electricity bill, water bill, mobile recharge, and other utility bill payments.', desc_bn: 'বিদ্যুৎ বিল, জলের বিল, মোবাইল রিচার্জ ও অন্যান্য ইউটিলিটি বিল পেমেন্ট।', price: '₹10 service charge', icon: 'fas fa-bolt', cat: 'Payments' },
    { name_en: 'Railway Ticket Booking', name_bn: 'রেলওয়ে টিকেট বুকিং', desc_en: 'IRCTC railway ticket booking assistance for general, tatkal and reservation.', desc_bn: 'আইআরসিটিসি সাধারণ, তৎকাল ও সংরক্ষণের জন্য রেলওয়ে টিকেট বুকিং সহায়তা।', price: 'Starting ₹30', icon: 'fas fa-train', cat: 'Travel' },
    { name_en: 'Income Certificate', name_bn: 'আয় সার্টিফিকেট', desc_en: 'Apply for income certificate from Block Development Office online.', desc_bn: 'ব্লক ডেভেলপমেন্ট অফিস থেকে অনলাইনে আয় সার্টিফিকেটের জন্য আবেদন।', price: 'Starting ₹50', icon: 'fas fa-file-invoice', cat: 'Certificate' },
    { name_en: 'Death & Birth Certificate', name_bn: 'মৃত্যু ও জন্ম সার্টিফিকেট', desc_en: 'Apply and download birth and death certificates from government portal.', desc_bn: 'সরকারি পোর্টাল থেকে জন্ম ও মৃত্যু সার্টিফিকেট আবেদন ও ডাউনলোড।', price: 'Starting ₹40', icon: 'fas fa-file-medical', cat: 'Certificate' },
    { name_en: 'Scanning & Lamination', name_bn: 'স্ক্যানিং ও ল্যামিনেশন', desc_en: 'Document scanning and lamination services at affordable rates.', desc_bn: 'সাশ্রয়ী মূল্যে ডকুমেন্ট স্ক্যানিং ও ল্যামিনেশন সেবা।', price: '₹5 – ₹20', icon: 'fas fa-layer-group', cat: 'Print' },
    { name_en: 'Swasthya Sathi / Health Scheme', name_bn: 'স্বাস্থ্য সাথী / স্বাস্থ্য প্রকল্প', desc_en: 'Enrollment and assistance for Swasthya Sathi and other state health schemes.', desc_bn: 'স্বাস্থ্য সাথী ও অন্যান্য রাজ্য স্বাস্থ্য প্রকল্পে নথিভুক্তি ও সহায়তা।', price: 'Free / ₹50 assistance', icon: 'fas fa-heartbeat', cat: 'Health' }
  ];
  services.forEach((s, i) => {
    db.services.push({
      id: genId(), name_en: s.name_en, name_bn: s.name_bn,
      description_en: s.desc_en, description_bn: s.desc_bn,
      price: s.price, icon: s.icon, category: s.cat, sort_order: i, is_active: 1
    });
  });

  // Default content
  const contentDefaults = [
    ['hero_title_en', 'Adak Enterprise – Tathya Mitra Kendra', 'অ্যাডাক এন্টারপ্রাইজ – তথ্য মিত্র কেন্দ্র'],
    ['hero_subtitle_en', 'Government & Online Services Made Easy', 'সরকারি ও অনলাইন সেবাগুলি সহজ করে'],
    ['about_intro_en', 'Adak Enterprise – Tathya Mitra Kendra is your trusted local Common Service Center (CSC) serving the people of West Bengal with government and digital services.', 'অ্যাডাক এন্টারপ্রাইজ – তথ্য মিত্র কেন্দ্র হল পশ্চিমবঙ্গের মানুষদের সরকারি ও ডিজিটাল সেবা প্রদানে আপনার বিশ্বস্ত স্থানীয় কমন সার্ভিস সেন্টার (সিএসসি)।'],
    ['about_mission_en', 'Our mission is to bridge the digital divide and make essential government services accessible to every citizen at their doorstep.', 'আমাদের লক্ষ্য হল ডিজিটাল বিভাজন দূর করা এবং প্রতিটি নাগরিকের দোরগোড়ায় প্রয়োজনীয় সরকারি সেবা সহজলভ্য করা।'],
    ['home_notice_en', '', '']
  ];
  contentDefaults.forEach(([k, en, bn]) => db.content.push({ key: k, value_en: en, value_bn: bn }));

  // Sample sale entry
  db.sales.push({
    id: genId(), client_name: 'Ramu Prasad', client_phone: '9876543210', client_address: 'Barasat, North 24 Parganas',
    services_taken: 'PAN Card Apply & Correction', total_amount: 150, amount_paid: 100,
    amount_due: 50, status: 'pending', notes: 'Sample entry – demo', entry_date: new Date().toISOString()
  });
}

module.exports = {
  db, save, genId
};
