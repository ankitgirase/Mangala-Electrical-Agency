# ⚡ Mangala Electrical Agency — Website

Professional website for Mangala Electrical Agency, Ner, Yavatmal, Maharashtra.

## Tech Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JS (no framework needed)
- **Backend**: Node.js + Express
- **Email**: Nodemailer (Gmail SMTP or any SMTP)
- **Data Storage**: Local JSON file (`enquiries.json`) — can be upgraded to MongoDB/MySQL

---

## Quick Start

### 1. Install Node.js
Download from https://nodejs.org (LTS version recommended)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your Gmail credentials and settings
```

### 4. Put the frontend in place
```bash
mkdir public
mv index.html public/
```

### 5. Start the server
```bash
npm start
# Development mode (auto-restart):
npm run dev
```

Open http://localhost:3000 in your browser.

---

## File Structure
```
mangala-electrical-agency/
├── public/
│   └── index.html          # Frontend (served statically)
├── server.js               # Express backend
├── package.json
├── .env.example            # Copy to .env and fill in values
├── .env                    # Your secrets (DO NOT commit to git)
└── enquiries.json          # Auto-created — stores all form submissions
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/contact` | Submit contact/quote form |
| GET | `/api/enquiries?token=YOUR_TOKEN` | View all enquiries (admin) |
| PATCH | `/api/enquiries/:id/status` | Update enquiry status (admin) |

### POST /api/contact — Request Body
```json
{
  "name": "Rajesh Kumar",
  "company": "Avaada Energy",
  "phone": "+91 98765 43210",
  "email": "rajesh@avaada.com",
  "service": "Solar Power Plant Support",
  "workers": "50–100 Workers",
  "location": "Yavatmal",
  "message": "Need 60 workers for pre-commissioning work..."
}
```

---

## Customisation Checklist

### Before Going Live:
- [ ] Replace `+91-XXXXX XXXXX` with your real phone number (in index.html, 3 places)
- [ ] Replace `info@mangalaelectrical.com` with your real email
- [ ] Update the office address in the Contact section and Footer
- [ ] Add real project photos (replace the SVG illustrations in the Projects section)
- [ ] Add actual client logos in the Projects section
- [ ] Fill in `.env` with Gmail credentials for email notifications
- [ ] Change `ADMIN_TOKEN` in `.env` to a strong secret

### Optional Upgrades:
- Add a real database (MongoDB Atlas is free) instead of `enquiries.json`
- Add WhatsApp button: `https://wa.me/91XXXXXXXXXX`
- Add Google Analytics for visitor tracking
- Deploy to: Hostinger, DigitalOcean, Railway, or Render (all support Node.js)

---

## Deployment (Hostinger / cPanel)

1. Upload all files via FTP or File Manager
2. Set up Node.js app in cPanel → Node.js selector
3. Point domain to your server
4. Set environment variables in cPanel

## Deployment (Railway / Render — Free)

1. Push code to GitHub
2. Connect repo to Railway.app or Render.com
3. Add environment variables in dashboard
4. Deploy — get a live URL instantly

---

## Contact
Mangala Electrical Agency · Ner, Yavatmal, Maharashtra
