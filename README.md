# Adak Enterprise – Tathya Mitra Kendra
## Complete Website & Admin Panel

---

## Quick Start

### 1. Install Dependencies
```bash
cd AdakEnterprise
npm install
```

### 2. Configure Environment (optional)
Edit `.env` to set:
- `ADMIN_PASSWORD` – change the default admin password
- `TWILIO_*` – add real Twilio credentials to enable SMS

### 3. Start the Server
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 4. Open in Browser
| Page | URL |
|---|---|
| Public Website | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin/login.html |
| API Health | http://localhost:3000/api/health |

---

## Default Admin Credentials
| Field | Value |
|---|---|
| Username | `admin` |
| Password | `AdakAdmin@2024` |

> **Important:** Change the password from Admin Panel → Settings after first login.

---

## Project Structure
```
AdakEnterprise/
├── server.js              # Express entry point
├── package.json
├── .env                   # Environment variables
├── adak_enterprise.db     # SQLite database (auto-created on first run)
├── database/
│   └── db.js              # Schema + seed data
├── routes/
│   ├── auth.js            # Login, password change
│   ├── services.js        # Services CRUD
│   ├── sales.js           # Sales CRUD + export
│   ├── shopinfo.js        # Shop info management
│   ├── notifications.js   # SMS notifications (Twilio)
│   └── content.js         # Content & banner management
├── middleware/
│   └── auth.js            # JWT middleware
├── uploads/               # Uploaded banner images
├── public/                # Public website
│   ├── index.html         # Home page
│   ├── services.html      # Services page
│   ├── about.html         # About page
│   ├── contact.html       # Contact page
│   ├── css/style.css      # Public CSS
│   └── js/
│       ├── i18n.js        # Bilingual EN/BN system
│       └── main.js        # Public JS logic
└── admin/                 # Admin panel
    ├── login.html         # Login page
    ├── dashboard.html     # Full dashboard (all sections)
    ├── css/admin.css      # Admin CSS
    └── js/admin.js        # Admin utilities
```

---

## SMS / WhatsApp Notifications

### Twilio SMS (Stub Mode by default)
The system runs in **stub mode** – notifications are logged to console but not sent.

To enable real SMS:
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID, Auth Token, and a phone number
3. Fill `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### WhatsApp Button
Set your WhatsApp number in **Admin → Shop Info** (`whatsapp` field).
Format: country code + number with no + sign. Example: `919876543210`

---

## Admin Panel Features

| Feature | Location |
|---|---|
| Dashboard stats & recent sales | Dashboard |
| Add/edit/delete sales entries | Sales & Entries |
| Filter by date, status, phone | Sales & Entries |
| Mark sale as Done + notify client | Sales → ✓ button |
| Client full history lookup | Client History |
| Export all sales to Excel | Sales → Export Excel |
| Send custom SMS | Notifications |
| Add/edit/delete services | Manage Services |
| Update prices | Manage Services → Edit |
| Edit shop address, phone, hours | Shop Info |
| Set WhatsApp number | Shop Info |
| Add Google Maps embed | Shop Info |
| Edit homepage notice | Content & Banners |
| Upload/manage banner images | Content & Banners |
| Change admin password | Settings |

---

## API Endpoints

### Public
| Method | URL | Description |
|---|---|---|
| GET | /api/services | All active services |
| GET | /api/shopinfo | Shop info |
| GET | /api/content | Page content |

### Admin (Bearer Token required)
| Method | URL | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/change-password | Change password |
| GET/POST | /api/services | List/Create services |
| PUT/DELETE | /api/services/:id | Update/Delete service |
| GET/POST | /api/sales | List/Create sales |
| PUT/DELETE | /api/sales/:id | Update/Delete sale |
| GET | /api/sales/stats | Dashboard stats |
| GET | /api/sales/export | Excel export |
| GET | /api/sales/client/:phone | Client history |
| POST | /api/notify/done/:id | Mark done + notify |
| POST | /api/notify/custom | Custom SMS |
| GET | /api/notify | Notification log |
| PUT | /api/shopinfo | Update shop info |
| GET/PUT | /api/content | Page content |
| POST | /api/content/banners | Add banner |
| DELETE | /api/content/banners/:id | Delete banner |

---

## Language Support

The public website fully supports **English** and **Bengali**.

- Toggle button in the top bar: `EN` / `বাং`
- Language preference is saved in browser localStorage
- All service names, descriptions, buttons, labels, and footer text translate
- Admin panel remains in English for ease of management
