require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Resend } = require("resend");
const crypto = require("crypto");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const app = express();
const loginAttempts = new Map();

mongoose.set("bufferCommands", false);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "*",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

// ─── MongoDB Connection ───────────────────────────────────────────────────────
async function connectToMongo() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MongoDB error: MONGODB_URI is not set");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB connected");
    return true;
  } catch (err) {
    console.error("❌ MongoDB error:", err);
    return false;
  }
}

function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database unavailable. Please check MongoDB connection settings.",
    });
  }
  next();
}

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function isLoginRateLimited(req) {
  const key = getClientKey(req);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.firstAttemptAt > windowMs) {
    loginAttempts.set(key, { count: 0, firstAttemptAt: now });
    return false;
  }

  return entry.count >= maxAttempts;
}

function recordLoginFailure(req) {
  const key = getClientKey(req);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.firstAttemptAt > windowMs) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  entry.count += 1;
  loginAttempts.set(key, entry);
}

function clearLoginAttempts(req) {
  loginAttempts.delete(getClientKey(req));
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["web", "mobile", "ai"], required: true },
    image: { type: String, required: true },
    tech: [String],
    overview: { type: String, default: "" },
    features: [String],
    highlights: [String],
    details: { type: String, default: "" },
    github: { type: String, default: "https://github.com/nis6hal" },
    demo: { type: String, default: "" },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  details: { type: String, default: "" },
  type: { type: String, enum: ["technical", "professional"], required: true },
  category: { type: String, default: "" }, // e.g., 'frontend', 'backend', 'tools'
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
});

const ContentSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

const CertificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, required: true },
    credentialUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Project = mongoose.model("Project", ProjectSchema);
const Skill = mongoose.model("Skill", SkillSchema);
const Content = mongoose.model("Content", ContentSchema);
const Certification = mongoose.model("Certification", CertificationSchema);

// ─── Contact Request Schema ───────────────────────────────────────────────────
const ContactRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const ContactRequest = mongoose.model("ContactRequest", ContactRequestSchema);

// ─── Nodemailer Transporter ───────────────────────────────────────────────────

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

function getDefaultProjects() {
  return [
    {
      title: "Smart Bus Arrival Detector",
      description:
        "Built a commuter-focused mobile app that tracks buses live and predicts arrival times for Pokhara city routes.",
      category: "mobile",
      image: "Images/Sbad.png",
      tech: ["React Native", "Firebase", "Google Maps", "Machine Learning"],
      overview:
        "Built for real commuter use, this mobile app combines live route visibility with ML-assisted ETA prediction to reduce waiting uncertainty on Pokhara bus routes.",
      features: [
        "Real-time bus location tracking on route maps",
        "ML-powered ETA prediction for active routes",
        "Route visualization for daily commuters",
        "Notification flow for approaching buses",
      ],
      highlights: [
        "Focused on reducing commuter waiting uncertainty",
        "Combined mobile UX with route-aware ETA prediction",
      ],
      order: 1,
    },
    {
      title: "Gate Automation",
      description:
        "Developed an edge AI gate-control system that detects license plates in real time and triggers automated access workflows.",
      category: "ai",
      image: "Images/Slpd.png",
      tech: ["Python", "OpenCV", "TensorFlow", "Arduino"],
      overview:
        "This project combines computer vision, OCR-style recognition, and hardware control to automate gate and parking access without relying on cloud processing.",
      features: [
        "Real-time license plate detection pipeline",
        "Recognition workflow integrated with gate logic",
        "Arduino-based hardware trigger support",
        "Local event logging for entry and exit records",
      ],
      highlights: [
        "Designed for low-latency local edge processing",
        "Bridged AI inference with real hardware control",
      ],
      order: 2,
    },
    {
      title: "Portfolio Website",
      description:
        "Designed and deployed a personal portfolio with an admin-managed content flow, responsive UI, and integrated contact workflow.",
      category: "web",
      image: "Images/Portfolio.png",
      tech: ["HTML5", "CSS3", "JavaScript"],
      overview:
        "Built from scratch with vanilla HTML, CSS, JavaScript, Express, and MongoDB-backed content, this portfolio balances visual polish with practical deployment and maintainability.",
      features: [
        "Responsive single-page portfolio experience",
        "Dynamic content loading from a REST API",
        "Admin panel for projects, skills, and content updates",
        "Integrated contact verification workflow",
      ],
      highlights: [
        "Combines frontend presentation with backend content management",
        "Deployed as a real multi-service portfolio stack",
      ],
      order: 3,
    },
    {
      title: "CineVault",
      description:
        "Built a React movie discovery app around the TMDb API with searchable browsing, rich detail views, and responsive dark UI.",
      category: "web",
      image: "Images/CineVault.png",
      tech: ["React", "TMDb API", "CSS3"],
      overview:
        "CineVault focuses on fast content discovery with category-based browsing, API-driven detail pages, and a polished dark interface for desktop and mobile users.",
      features: [
        "Real-time search powered by the TMDb API",
        "Trending and top-rated discovery flows",
        "Detailed movie views with richer context",
        "Responsive dark interface for smaller screens",
      ],
      highlights: [
        "Focused on clean API-driven UI flows",
        "Improved browsing experience with responsive design",
      ],
      order: 4,
    },
    {
      title: "ReadLib",
      description:
        "Created a local-first reading and library app with persistent book storage and an in-browser PDF reading workflow.",
      category: "web",
      image: "Images/ReadLib.png",
      tech: ["React", "IndexedDB", "pdf.js"],
      overview:
        "ReadLib keeps everything on-device, combining IndexedDB persistence with PDF.js to create a lightweight personal library and reading tracker without server dependency.",
      features: [
        "Integrated in-browser PDF reading experience",
        "IndexedDB-based local persistence for offline use",
        "Book sorting, categorization, and filtering",
        "Reading-position memory for returning to documents",
      ],
      highlights: [
        "No backend required for personal reading data",
        "Built around practical offline-first usage",
      ],
      order: 5,
    },
    {
      title: "UniLib",
      description:
        "Built a full-stack university library system covering inventory, member workflows, and admin-side operations.",
      category: "web",
      image: "Images/UniLib.png",
      tech: ["React", "Node.js", "MongoDB", "Express"],
      overview:
        "UniLib brings together frontend workflows, REST APIs, and MongoDB-backed records to support common university library tasks such as inventory, borrowing, and member management.",
      features: [
        "Authentication flow for protected user access",
        "Admin dashboard for inventory and management tasks",
        "Borrowing and return workflow tracking",
        "Reporting-friendly inventory visibility",
      ],
      highlights: [
        "Connected frontend and backend flows in one product",
        "Structured around realistic university library operations",
      ],
      order: 6,
    },
  ];
}

// ─── Seed Default Data ────────────────────────────────────────────────────────
async function seedDefaults() {
  const defaultProjects = getDefaultProjects();
  for (const p of defaultProjects) {
    const { visible, ...updateFields } = p;
    await Project.findOneAndUpdate(
      { title: p.title },
      {
        $set: updateFields,
        $setOnInsert: { visible: true },
      },
      { upsert: true }
    );
  }
  console.log("✅ Projects synchronized (upserted)");

  // Intelligent Skill Sync (Upsert defaults)
  const defaultSkills = [
    {
      name: "Problem Solving",
      level: "Expert",
      type: "professional",
      details: "Analytical thinking and debugging expertise",
      order: 1,
    },
    {
      name: "Communication",
      level: "Expert",
      type: "professional",
      details: "Clear client interaction and team collaboration",
      order: 2,
    },
    {
      name: "Team Work",
      level: "Expert",
      type: "professional",
      details: "Agile methodology and project coordination",
      order: 3,
    },
    {
      name: "Creativity",
      level: "Expert",
      type: "professional",
      details: "Innovative solutions and UI/UX design",
      order: 4,
    },
    {
      name: "HTML5",
      level: "Expert",
      type: "technical",
      category: "frontend",
      order: 1,
    },
    {
      name: "CSS3",
      level: "Expert",
      type: "technical",
      category: "frontend",
      order: 2,
    },
    {
      name: "JavaScript",
      level: "Expert",
      type: "technical",
      category: "frontend",
      order: 3,
    },
    {
      name: "React",
      level: "Expert",
      type: "technical",
      category: "frontend",
      order: 4,
    },
    {
      name: "Python",
      level: "Expert",
      type: "technical",
      category: "backend",
      order: 5,
    },
    {
      name: "Node.js",
      level: "Expert",
      type: "technical",
      category: "backend",
      order: 6,
    },
    {
      name: "MongoDB",
      level: "Expert",
      type: "technical",
      category: "backend",
      order: 7,
    },
    {
      name: "OpenCV",
      level: "Intermediate",
      type: "technical",
      category: "ai",
      order: 8,
    },
    {
      name: "TensorFlow",
      level: "Intermediate",
      type: "technical",
      category: "ai",
      order: 9,
    },
    {
      name: "Git",
      level: "Expert",
      type: "technical",
      category: "tools",
      order: 10,
    },
    {
      name: "Docker",
      level: "Intermediate",
      type: "technical",
      category: "tools",
      order: 11,
    },
    {
      name: "Vercel",
      level: "Expert",
      type: "technical",
      category: "tools",
      order: 12,
    },
    {
      name: "Render",
      level: "Expert",
      type: "technical",
      category: "tools",
      order: 13,
    },
    {
      name: "Figma",
      level: "Intermediate",
      type: "technical",
      category: "tools",
      order: 14,
    },
  ];

  for (const s of defaultSkills) {
    const { visible, ...updateFields } = s;
    await Skill.findOneAndUpdate(
      { name: s.name },
      {
        $set: updateFields,
        $setOnInsert: { visible: true },
      },
      { upsert: true }
    );
  }
  console.log("✅ Skills synchronized (upserted)");

  // Intelligent Certifications Sync (Upsert defaults matching source code)
  const defaultCertifications = [
    {
      name: "Cloud & DevOps Training",
      issuer: "Pokhara University",
      date: "2026/04/30",
      credentialUrl: "Images/Certs/Cloud%26Devops.jpg",
      order: 1,
    },
    {
      name: "Fundamentals of Data Science",
      issuer: "Great Learning Academy",
      date: "2024/02",
      credentialUrl: "Images/Certs/FundsofDS.jpg",
      order: 2,
    },
    {
      name: "Git & GitHub Course",
      issuer: "Technology Channel",
      date: "2026-05-21",
      credentialUrl: "Images/Certs/Gitcerts.jpg",
      order: 3,
    },
    {
      name: "Nepal Telecom (NTC) Internship",
      issuer: "Nepal Telecom (NTC)",
      date: "2026",
      credentialUrl: "Images/Certs/NTCcerts.jpg",
      order: 4,
    },
  ];

  for (const c of defaultCertifications) {
    const { visible, ...updateFields } = c;
    await Certification.findOneAndUpdate(
      { name: c.name },
      {
        $set: updateFields,
        $setOnInsert: { visible: true },
      },
      { upsert: true }
    );
  }
  console.log("✅ Certifications synchronized (upserted)");

  // Seed content if empty
  const contentCount = await Content.countDocuments();
  if (contentCount === 0) {
    await Content.insertMany([
      {
        key: "hero",
        value: {
          name: "Nischal Bhandari",
          tagline: "Computer Engineering Student",
          description:
            "Computer Engineering student building clean digital products across web, AI, and backend systems.",
        },
      },
      {
        key: "about",
        value: {
          bio1: "I'm a passionate Computer Engineering student at Pokhara University, Nepal, with a strong foundation in full-stack development.",
          bio2: "When I'm not coding, you can find me exploring new technologies, contributing to open-source projects.",
          bio3: "My journey in technology started with curiosity and has evolved into a passion for creating digital solutions that impact people's lives positively.",
        },
      },
      {
        key: "contact",
        value: {
          email: "itisnischal@gmail.com",
          location: "Pokhara, Nepal",
          github: "https://github.com/nis6hal",
          linkedin: "https://linkedin.com/in/nis6hal",
          twitter: "https://twitter.com/nis6hal",
          instagram: "https://instagram.com/nis6hal",
        },
      },
      { key: "sections", value: { showGithubActivity: true } },
    ]);
    console.log("✅ Default content seeded");
  }
}

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Get all portfolio data in one call (used by frontend on load)
app.get("/api/portfolio", requireDb, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    const [projects, skills, contentDocs, certifications] = await Promise.all([
      Project.find({ visible: { $ne: false } }).sort({ order: 1 }),
      Skill.find({ visible: { $ne: false } }).sort({ order: 1 }),
      Content.find(),
      Certification.find({ visible: { $ne: false } }).sort({ order: 1, createdAt: -1 }),
    ]);
    const content = {};
    contentDocs.forEach((c) => {
      content[c.key] = c.value;
    });
    res.json({ projects, skills, certifications, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get projects
app.get("/api/projects", requireDb, async (req, res) => {
  try {
    const projects = await Project.find({ visible: { $ne: false } }).sort({ order: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get skills
app.get("/api/skills", requireDb, async (req, res) => {
  try {
    const skills = await Skill.find({ visible: { $ne: false } }).sort({ order: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get certifications
app.get("/api/certifications", requireDb, async (req, res) => {
  try {
    const certifications = await Certification.find({ visible: { $ne: false } }).sort({ order: 1, createdAt: -1 });
    res.json(certifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get content by key
app.get("/api/content/:key", requireDb, async (req, res) => {
  try {
    const doc = await Content.findOne({ key: req.params.key });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc.value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CONTACT ROUTES ───────────────────────────────────────────────────────────

// Step 1: User submits form → send verification email to them
app.post("/api/contact/submit", requireDb, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: "All fields are required" });

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: "Invalid email address" });

    // Rate limit: max 2 unverified requests per email in last hour
    const recentCount = await ContactRequest.countDocuments({
      email,
      verified: false,
      createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
    });
    if (recentCount >= 2)
      return res
        .status(429)
        .json({ error: "Too many requests. Please try again later." });

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry

    await ContactRequest.create({
      name,
      email,
      subject,
      message,
      token,
      expiresAt,
    });

    const verifyUrl = `${process.env.BACKEND_URL || "https://nischal-portfolio-api.onrender.com"}/api/contact/verify/${token}`;

    if (!resend) {
      return res.status(503).json({
        error: "Email service unavailable. RESEND_API_KEY is not configured.",
      });
    }

    // Send verification email to the submitter
    await resend.emails.send({
      from: "Nischal Bhandari Portfolio <noreply@nischal-bhandari.com.np>",
      to: email,
      subject: "✅ Confirm your message to Nischal Bhandari",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#04040f;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#04040f;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0d24;border:1px solid #1a1a3a;border-top:3px solid #F5B800;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
                <!-- Header -->
                <tr><td style="padding:32px 36px 24px;border-bottom:1px solid #1a1a3a;">
                  <div style="font-size:22px;font-weight:800;color:#F5B800;letter-spacing:-0.5px;">NB</div>
                  <div style="font-size:12px;color:#8888aa;font-family:monospace;margin-top:2px;">PORTFOLIO · VERIFY REQUEST</div>
                </td></tr>
                <!-- Body -->
                <tr><td style="padding:32px 36px;">
                  <h2 style="margin:0 0 12px;font-size:20px;color:#f0f0ff;font-weight:700;">Hi ${name} 👋</h2>
                  <p style="margin:0 0 20px;color:#8888aa;font-size:14px;line-height:1.7;">
                    You submitted a contact request to <strong style="color:#f0f0ff;">Nischal Bhandari's</strong> portfolio.
                    Please confirm it was really you by clicking the button below.
                  </p>
                  <!-- Message preview -->
                  <div style="background:#090918;border:1px solid #1a1a3a;border-left:3px solid #F5B800;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                    <div style="font-size:11px;color:#F5B800;font-family:monospace;letter-spacing:1px;margin-bottom:10px;">YOUR MESSAGE</div>
                    <div style="font-size:13px;color:#8888aa;margin-bottom:6px;"><strong style="color:#f0f0ff;">Subject:</strong> ${subject}</div>
                    <div style="font-size:13px;color:#8888aa;line-height:1.6;">${message.replace(/\n/g, "<br>")}</div>
                  </div>
                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr><td align="center">
                      <a href="${verifyUrl}" style="display:inline-block;background:#F5B800;color:#000;font-weight:700;font-size:14px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                        ✅ Confirm My Message
                      </a>
                    </td></tr>
                  </table>
                  <p style="margin:24px 0 0;font-size:12px;color:#555577;text-align:center;line-height:1.6;">
                    This link expires in <strong style="color:#8888aa;">30 minutes</strong>.<br>
                    If you didn't submit this form, you can safely ignore this email.
                  </p>
                </td></tr>
                <!-- Footer -->
                <tr><td style="padding:20px 36px;border-top:1px solid #1a1a3a;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#555577;">nischal-bhandari.com.np · Pokhara, Nepal</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    res.json({
      message:
        "Verification email sent! Please check your inbox and confirm your message.",
    });
  } catch (err) {
    console.error("Contact submit error:", err.message, err.code);
    res.status(500).json({
      error: "Failed to send verification email. Please try again.",
      detail: err.message,
    });
  }
});

// Step 2: User clicks link → forward message to Nischal
app.get("/api/contact/verify/:token", requireDb, async (req, res) => {
  try {
    const request = await ContactRequest.findOne({
      token: req.params.token,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!request) {
      return res.send(`
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Link Expired</title>
        <style>body{background:#04040f;color:#f0f0ff;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
        .box{text-align:center;padding:48px;background:#0d0d24;border:1px solid #1a1a3a;border-top:3px solid #ef4444;border-radius:16px;max-width:420px;}
        h2{color:#ef4444;margin:0 0 12px;}p{color:#8888aa;font-size:14px;}</style></head>
        <body><div class="box"><h2>❌ Link Expired</h2><p>This verification link has expired or already been used.<br>Please submit the form again.</p></div></body></html>
      `);
    }

    // Mark as verified
    request.verified = true;
    await request.save();

    if (!resend) {
      return res
        .status(503)
        .send("Email service unavailable. RESEND_API_KEY is not configured.");
    }

    // Forward the message to Nischal
    await resend.emails.send({
      from: "Portfolio Contact <noreply@nischal-bhandari.com.np>",
      to: "itisnischal@gmail.com",
      replyTo: request.email,
      subject: `📬 New Verified Message: ${request.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#04040f;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#04040f;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0d24;border:1px solid #1a1a3a;border-top:3px solid #F5B800;border-radius:16px;max-width:560px;width:100%;">
                <tr><td style="padding:32px 36px 24px;border-bottom:1px solid #1a1a3a;">
                  <div style="font-size:22px;font-weight:800;color:#F5B800;">NB</div>
                  <div style="font-size:12px;color:#8888aa;font-family:monospace;margin-top:2px;">PORTFOLIO · NEW VERIFIED MESSAGE</div>
                </td></tr>
                <tr><td style="padding:32px 36px;">
                  <div style="background:#090918;border:1px solid #1a1a3a;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding:6px 0;font-size:13px;color:#8888aa;width:80px;">From</td><td style="font-size:13px;color:#f0f0ff;font-weight:600;">${request.name}</td></tr>
                      <tr><td style="padding:6px 0;font-size:13px;color:#8888aa;">Email</td><td style="font-size:13px;color:#F5B800;">${request.email}</td></tr>
                      <tr><td style="padding:6px 0;font-size:13px;color:#8888aa;">Subject</td><td style="font-size:13px;color:#f0f0ff;">${request.subject}</td></tr>
                    </table>
                  </div>
                  <div style="background:#090918;border:1px solid #1a1a3a;border-left:3px solid #F5B800;border-radius:8px;padding:16px 20px;">
                    <div style="font-size:11px;color:#F5B800;font-family:monospace;letter-spacing:1px;margin-bottom:10px;">MESSAGE</div>
                    <p style="margin:0;font-size:14px;color:#c0c0d0;line-height:1.8;">${request.message.replace(/\n/g, "<br>")}</p>
                  </div>
                  <p style="margin:20px 0 0;font-size:12px;color:#555577;text-align:center;">Hit Reply to respond directly to ${request.email}</p>
                </td></tr>
                <tr><td style="padding:20px 36px;border-top:1px solid #1a1a3a;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#555577;">nischal-bhandari.com.np · Verified submission</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
      `,
    });

    // Show success page
    res.send(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Message Confirmed</title>
      <style>body{background:#04040f;color:#f0f0ff;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
      .box{text-align:center;padding:48px;background:#0d0d24;border:1px solid #1a1a3a;border-top:3px solid #F5B800;border-radius:16px;max-width:420px;}
      h2{color:#F5B800;margin:0 0 12px;}p{color:#8888aa;font-size:14px;line-height:1.7;}
      a{color:#F5B800;text-decoration:none;font-size:13px;}</style></head>
      <body><div class="box">
        <h2>✅ Message Sent!</h2>
        <p>Your message has been verified and forwarded to Nischal.<br>He'll get back to you at <strong style="color:#f0f0ff;">${request.email}</strong> soon.</p>
        <br><a href="https://nischal-bhandari.com.np">← Back to portfolio</a>
      </div></body></html>
    `);
  } catch (err) {
    console.error("Contact verify error:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  if (isLoginRateLimited(req)) {
    return res.status(429).json({
      error: "Too many login attempts. Please wait 15 minutes and try again.",
    });
  }

  const validUser = username === process.env.ADMIN_USERNAME;
  const validPass = password === process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    recordLoginFailure(req);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  clearLoginAttempts(req);
  const token = jwt.sign({ username, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  res.json({ token, message: "Login successful" });
});

app.get("/api/auth/verify", authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ─── ADMIN ROUTES (protected) ─────────────────────────────────────────────────

// --- Projects ---
app.get("/api/admin/projects", authMiddleware, requireDb, async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/projects", authMiddleware, requireDb, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put(
  "/api/admin/projects/:id",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!project) return res.status(404).json({ error: "Project not found" });
      res.json(project);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

app.delete(
  "/api/admin/projects/:id",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      await Project.findByIdAndDelete(req.params.id);
      res.json({ message: "Project deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.post(
  "/api/admin/projects/sync-defaults",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      await seedDefaults();
      res.json({ message: "Projects synchronized with current defaults" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// --- Skills ---
app.get("/api/admin/skills", authMiddleware, requireDb, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ type: 1, order: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/admin/skills/:id",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!skill) return res.status(404).json({ error: "Skill not found" });
      res.json(skill);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

app.post("/api/admin/skills", authMiddleware, requireDb, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete(
  "/api/admin/skills/:id",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      await Skill.findByIdAndDelete(req.params.id);
      res.json({ message: "Skill deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.post(
  "/api/admin/skills/sync-defaults",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      await seedDefaults(); // seedDefaults now handles skills with upsert
      res.json({ message: "Skills synchronized with current defaults" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// --- Certifications ---
app.get(
  "/api/admin/certifications",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      const certifications = await Certification.find().sort({ createdAt: -1 });
      res.json(certifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.post("/api/certifications", authMiddleware, requireDb, async (req, res) => {
  try {
    const cert = new Certification(req.body);
    await cert.save();
    res.status(201).json(cert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put(
  "/api/certifications/:id",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      const cert = await Certification.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );
      if (!cert)
        return res.status(404).json({ error: "Certification not found" });
      res.json(cert);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

app.delete(
  "/api/certifications/:id",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      const cert = await Certification.findByIdAndDelete(req.params.id);
      if (!cert)
        return res.status(404).json({ error: "Certification not found" });
      res.json({ message: "Certification deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.post(
  "/api/admin/certifications/sync-defaults",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      await seedDefaults();
      res.json({ message: "Certifications synchronized with current defaults" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// --- Content ---
app.put(
  "/api/admin/content/:key",
  authMiddleware,
  requireDb,
  async (req, res) => {
    try {
      const doc = await Content.findOneAndUpdate(
        { key: req.params.key },
        { $set: { value: req.body } },
        { new: true, upsert: true },
      );
      res.json(doc.value);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

async function startServer() {
  const mongoConnected = await connectToMongo();

  if (mongoConnected) {
    try {
      await seedDefaults();
    } catch (err) {
      console.error("❌ Seed error:", err);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
