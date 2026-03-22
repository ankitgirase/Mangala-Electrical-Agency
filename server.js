/**
 * Mangala Electrical Agency — Backend Server
 * Node.js + Express + MongoDB (Mongoose)
 *
 * Setup:
 *   1. npm install
 *   2. cp .env.example .env  →  fill in MONGODB_URI and other values
 *   3. node server.js
 *
 * Environment variables (.env):
 *   PORT=3000
 *   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/mangala_db?retryWrites=true&w=majority
 *   EMAIL_USER=your@gmail.com
 *   EMAIL_PASS=your_16_char_app_password
 *   CONTACT_RECEIVER=owner@mangalaelectrical.com
 *   ADMIN_TOKEN=your_secure_random_token
 */

require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Connect to MongoDB Atlas ─────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if DB connection fails — don't serve a broken app
  });

// ─── Enquiry Schema & Model ───────────────────────────
const enquirySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    company:  { type: String, trim: true, default: '' },
    phone:    { type: String, required: true, trim: true },
    email:    { type: String, trim: true, lowercase: true, default: '' },
    service:  { type: String, required: true, trim: true },
    workers:  { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    message:  { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in-progress', 'closed'],
      default: 'new',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// ─── Middleware ───────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// ─── Admin Auth Middleware ────────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized — invalid or missing admin token.' });
  }
  next();
}

// ─── Email Notification ───────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your login password)
  },
});

function sendNotificationEmail(enquiry) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured — skipping notification.');
    return;
  }

  const IST = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata',
  }).format(new Date(enquiry.createdAt));

  const mailOptions = {
    from: `"Mangala Electrical Website" <${process.env.EMAIL_USER}>`,
    to:   process.env.CONTACT_RECEIVER || process.env.EMAIL_USER,
    subject: `New Enquiry from ${enquiry.name} — ${enquiry.service}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0056b3;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:#ffcc00;margin:0;font-size:1.4rem;">New Manpower Enquiry</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:0.9rem;">
            Mangala Electrical Agency Website — ${IST}
          </p>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
          <table style="width:100%;border-collapse:collapse;font-size:0.92rem;">
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 0;font-weight:bold;color:#374151;width:35%;">Name</td>
              <td style="padding:10px 0;color:#111827;">${enquiry.name}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 0;font-weight:bold;color:#374151;">Company</td>
              <td style="padding:10px 0;color:#111827;">${enquiry.company || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 0;font-weight:bold;color:#374151;">Phone</td>
              <td style="padding:10px 0;"><a href="tel:${enquiry.phone}" style="color:#0056b3;">${enquiry.phone}</a></td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 0;font-weight:bold;color:#374151;">Email</td>
              <td style="padding:10px 0;color:#111827;">${enquiry.email || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 0;font-weight:bold;color:#374151;">Service</td>
              <td style="padding:10px 0;color:#0056b3;font-weight:600;">${enquiry.service}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 0;font-weight:bold;color:#374151;">Workers Needed</td>
              <td style="padding:10px 0;color:#111827;">${enquiry.workers || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 0;font-weight:bold;color:#374151;">Project Location</td>
              <td style="padding:10px 0;color:#111827;">${enquiry.location || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-weight:bold;color:#374151;vertical-align:top;">Message</td>
              <td style="padding:10px 0;color:#111827;">${enquiry.message || '—'}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:14px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;">
            <p style="margin:0;font-size:0.85rem;color:#92400e;">
              MongoDB ID: <code>${enquiry._id}</code>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('❌ Email error:', err.message);
    else     console.log('📧 Notification sent —', info.messageId);
  });
}

// ═══════════════════════════════════════════════════════
// ─── API Routes ───────────────────────────────────────
// ═══════════════════════════════════════════════════════

// GET /api/health — server + DB status
app.get('/api/health', (req, res) => {
  res.json({
    status:   'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────
// POST /api/contact — submit a new enquiry
// ─────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, service } = req.body;

    if (!name || !phone || !service) {
      return res.status(400).json({
        error: 'name, phone, and service are required fields.',
      });
    }

    // Save to MongoDB
    const enquiry = await Enquiry.create({
      name:     req.body.name,
      company:  req.body.company,
      phone:    req.body.phone,
      email:    req.body.email,
      service:  req.body.service,
      workers:  req.body.workers,
      location: req.body.location,
      message:  req.body.message,
    });

    console.log(`📥 Saved — ${enquiry.name} (${enquiry.phone}) — ${enquiry.service} [${enquiry._id}]`);

    // Fire-and-forget email notification
    sendNotificationEmail(enquiry);

    res.status(201).json({
      success: true,
      message: 'Enquiry received. Our team will contact you within 24 hours.',
      id: enquiry._id,
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error('POST /api/contact error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/enquiries — list all enquiries (admin)
// Query params:
//   ?status=new|contacted|in-progress|closed
//   ?page=1&limit=20
//   ?sort=createdAt  or  -createdAt  (default: newest first)
// ─────────────────────────────────────────────────────
app.get('/api/enquiries', requireAdmin, async (req, res) => {
  try {
    const { status, service, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (status)  filter.status  = status;
    if (service) filter.service = service;

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    res.json({
      total,
      page:  Number(page),
      pages: Math.ceil(total / limit),
      data:  enquiries,
    });

  } catch (err) {
    console.error('GET /api/enquiries error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/enquiries/:id — single enquiry (admin)
// ─────────────────────────────────────────────────────
app.get('/api/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).lean();
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json(enquiry);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format.' });
  }
});

// ─────────────────────────────────────────────────────
// PATCH /api/enquiries/:id/status — update status (admin)
// Body: { "status": "contacted" | "in-progress" | "closed" | "new" }
// ─────────────────────────────────────────────────────
app.patch('/api/enquiries/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'in-progress', 'closed'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });

    console.log(`✏️  Enquiry ${enquiry._id} status updated to "${status}"`);
    res.json({ success: true, enquiry });

  } catch (err) {
    res.status(400).json({ error: 'Invalid ID or update failed.' });
  }
});

// ─────────────────────────────────────────────────────
// DELETE /api/enquiries/:id — delete an enquiry (admin)
// ─────────────────────────────────────────────────────
app.delete('/api/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });
    console.log(`🗑️  Enquiry ${req.params.id} deleted`);
    res.json({ success: true, message: 'Enquiry deleted.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/stats — dashboard stats (admin)
// ─────────────────────────────────────────────────────
app.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const [total, byStatus, byService] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Enquiry.aggregate([
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({ total, byStatus, byService });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────
// GET /admin — serve the admin dashboard
// ─────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ─────────────────────────────────────────────────────
// Catch-all → serve frontend
// ─────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚡ Mangala Electrical Agency Server`);
  console.log(`   Running at  : http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB URI set  : ${process.env.MONGODB_URI ? '✅ Yes' : '❌ No — set MONGODB_URI in .env'}\n`);
});