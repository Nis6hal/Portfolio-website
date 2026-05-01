require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const crypto = require('crypto');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || '*',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  credentials: true
}));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['web', 'mobile', 'ai'], required: true },
  image:       { type: String, required: true },
  tech:        [String],
  details:     { type: String, default: '' },
  github:      { type: String, default: 'https://github.com/nis6hal' },
  demo:        { type: String, default: '' },
  order:       { type: Number, default: 0 },
  visible:     { type: Boolean, default: true }
}, { timestamps: true });

const SkillSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  percentage: { type: Number, required: true },
  level:      { type: String, required: true },
  details:    { type: String, default: '' },
  type:       { type: String, enum: ['technical', 'professional'], required: true },
  order:      { type: Number, default: 0 }
});

const ContentSchema = new mongoose.Schema({
  key:   { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: String, required: true },
  credentialUrl: { type: String, default: '' }
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);
const Skill   = mongoose.model('Skill',   SkillSchema);
const Content = mongoose.model('Content', ContentSchema);
const Certification = mongoose.model('Certification', CertificationSchema);

// ─── Contact Request Schema ───────────────────────────────────────────────────
const ContactRequestSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  subject:   { type: String, required: true },
  message:   { type: String, required: true },
  token:     { type: String, required: true, unique: true },
  verified:  { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

const ContactRequest = mongoose.model('ContactRequest', ContactRequestSchema);

// ─── Nodemailer Transporter ───────────────────────────────────────────────────


// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Seed Default Data ────────────────────────────────────────────────────────
async function seedDefaults() {
  // Seed projects if empty
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      {
        title: 'PixelPrompt',
        description: 'AI-powered wireframe to website generator. Draw a sketch, get a live responsive site.',
        category: 'web',
        image: 'Images/PixelPrompt.png',
        tech: ['React', 'Node.js', 'OpenAI'],
        details: '<p>An AI-powered tool that converts hand-drawn wireframe sketches into fully responsive websites.</p><h3>Key Features</h3><ul><li>Sketch-to-code conversion using OpenAI Vision API</li><li>Responsive HTML/CSS generation</li><li>Live preview and export functionality</li><li>Multi-page site generation</li></ul><h3>Highlights</h3><p>Reduced wireframe-to-prototype time by 80%. Supports complex layouts including grids, navbars, and forms.</p>',
        order: 1
      },
      {
        title: 'Smart License Plate Detection',
        description: 'Edge AI system for real-time license plate recognition and automated gate control.',
        category: 'ai',
        image: 'Images/Slpd.png',
        tech: ['Python', 'OpenCV', 'TensorFlow'],
        details: '<p>An edge AI system for real-time license plate recognition, designed for automated gate control and parking management.</p><h3>Key Features</h3><ul><li>Real-time plate detection at 30 FPS</li><li>Support for Nepali and international plates</li><li>Automated gate/barrier control</li><li>Vehicle entry/exit logging</li></ul><h3>Highlights</h3><p>98%+ detection accuracy in varied lighting. Runs efficiently on low-power hardware with sub-100ms latency.</p>',
        order: 2
      },
      {
        title: 'Smart Bus Arrival Detector',
        description: 'Real-time bus tracking and ML-powered ETAs for Pokhara city routes.',
        category: 'mobile',
        image: 'Images/Sbad.png',
        tech: ['React Native', 'Firebase', 'Google Maps'],
        details: '<p>A mobile app providing real-time bus arrival times and ML-powered ETAs for Pokhara city routes.</p><h3>Key Features</h3><ul><li>Real-time bus tracking on live map</li><li>ML-powered arrival time prediction</li><li>Push notifications for upcoming buses</li><li>Route planning and optimization</li></ul><h3>Highlights</h3><p>Serves daily commuters across 12 major Pokhara routes. Prediction accuracy within ±2 minutes.</p>',
        order: 3
      },
      {
        title: 'Portfolio Website',
        description: 'The minimalist portfolio website you\'re currently viewing.',
        category: 'web',
        image: 'Images/Portfolio.png',
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Node.js'],
        details: '<p>The minimalist portfolio website you\'re currently viewing — built from scratch with vanilla HTML, CSS, JavaScript, and a Node.js backend.</p><h3>Key Features</h3><ul><li>Rule-based AI chatbot with score-based keyword matching</li><li>Responsive flip-card portfolio and interactive UI</li><li>Admin panel for managing content and projects</li><li>Animated skill bars and hexagonal progress displays</li></ul><h3>Highlights</h3><p>Single-file frontend architecture with dynamic API-driven content and zero build tools.</p>',
        order: 4
      }
    ]);
    console.log('✅ Default projects seeded');
  }

  // Seed skills if empty
  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    await Skill.insertMany([
      { name: 'HTML/CSS',    percentage: 85, level: 'Expert',   type: 'technical',     details: '2+ years • Responsive Design • CSS Grid/Flexbox', order: 1 },
      { name: 'JavaScript', percentage: 45, level: 'Beginner',  type: 'technical',     details: '2+ years • ES6+ • Async • DOM',                   order: 2 },
      { name: 'React',       percentage: 45, level: 'Beginner',  type: 'technical',     details: '2+ years • Hooks • Context • Redux',              order: 3 },
      { name: 'Node.js',     percentage: 35, level: 'Beginner',  type: 'technical',     details: '2+ years • Express • RESTful APIs',               order: 4 },
      { name: 'Python',      percentage: 40, level: 'Beginner',  type: 'technical',     details: '1+ years • Django • Flask • AI/ML',               order: 5 },
      { name: 'Problem Solving', percentage: 90, level: 'Expert', type: 'professional', details: 'Analytical thinking and debugging expertise',      order: 1 },
      { name: 'Communication',   percentage: 80, level: 'Expert', type: 'professional', details: 'Clear client interaction and team collaboration', order: 2 },
      { name: 'Team Work',       percentage: 80, level: 'Expert', type: 'professional', details: 'Agile methodology and project coordination',      order: 3 },
      { name: 'Creativity',      percentage: 85, level: 'Expert', type: 'professional', details: 'Innovative solutions and UI/UX design',           order: 4 },
    ]);
    console.log('✅ Default skills seeded');
  }

  // Seed content if empty
  const contentCount = await Content.countDocuments();
  if (contentCount === 0) {
    await Content.insertMany([
      { key: 'hero',    value: { name: 'Nischal Bhandari', tagline: 'Full Stack Developer', description: 'Computer Engineering student building production-grade experiences for the past 2+ years with a focus on performance, maintainability, and user-first solutions.' } },
      { key: 'about',   value: { bio1: "I'm a passionate Computer Engineering student at Pokhara University, Nepal, with a strong foundation in full-stack development.", bio2: "When I'm not coding, you can find me exploring new technologies, contributing to open-source projects.", bio3: "My journey in technology started with curiosity and has evolved into a passion for creating digital solutions that impact people's lives positively." } },
      { key: 'contact', value: { email: 'itisnischal@gmail.com', location: 'Pokhara, Nepal', github: 'https://github.com/nis6hal', linkedin: 'https://linkedin.com/in/nis6hal', twitter: 'https://twitter.com/nis6hal', instagram: 'https://instagram.com/nis6hal' } },
      { key: 'sections', value: { showGithubActivity: true, showFeaturedMarquee: true } }
    ]);
    console.log('✅ Default content seeded');
  }

  // Seed certifications if empty
  const certCount = await Certification.countDocuments();
  if (certCount === 0) {
    await Certification.insertMany([
      {
        name: 'Cloud & DevOps Training',
        issuer: 'TechAxis Nepal',
        date: '2025',
        credentialUrl: ''
      },
      {
        name: 'Fundamentals of Data Science',
        issuer: 'IBM SkillsBuild',
        date: '2024',
        credentialUrl: ''
      }
    ]);
    console.log('✅ Default certifications seeded');
  }
}

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all portfolio data in one call (used by frontend on load)
app.get('/api/portfolio', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    const [projects, skills, contentDocs, certifications] = await Promise.all([
      Project.find({ visible: true }).sort({ order: 1 }),
      Skill.find().sort({ order: 1 }),
      Content.find(),
      Certification.find().sort({ createdAt: -1 })
    ]);
    const content = {};
    contentDocs.forEach(c => { content[c.key] = c.value; });
    res.json({ projects, skills, certifications, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find({ visible: true }).sort({ order: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get certifications
app.get('/api/certifications', async (req, res) => {
  try {
    const certifications = await Certification.find().sort({ createdAt: -1 });
    res.json(certifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get content by key
app.get('/api/content/:key', async (req, res) => {
  try {
    const doc = await Content.findOne({ key: req.params.key });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc.value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CONTACT ROUTES ───────────────────────────────────────────────────────────

// Step 1: User submits form → send verification email to them
app.post('/api/contact/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: 'All fields are required' });

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address' });

    // Rate limit: max 2 unverified requests per email in last hour
    const recentCount = await ContactRequest.countDocuments({
      email,
      verified: false,
      createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) }
    });
    if (recentCount >= 2)
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });

    // Create verification token
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry

    await ContactRequest.create({ name, email, subject, message, token, expiresAt });

    const verifyUrl = `${process.env.BACKEND_URL || 'https://nischal-portfolio-api.onrender.com'}/api/contact/verify/${token}`;

    // Send verification email to the submitter
    await resend.emails.send({
      from: 'Nischal Bhandari Portfolio <noreply@nischal-bhandari.com.np>',
      to: email,
      subject: '✅ Confirm your message to Nischal Bhandari',
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
                    <div style="font-size:13px;color:#8888aa;line-height:1.6;">${message.replace(/\n/g, '<br>')}</div>
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
      `
    });

    res.json({ message: 'Verification email sent! Please check your inbox and confirm your message.' });

  } catch (err) {
    console.error('Contact submit error:', err.message, err.code);
    res.status(500).json({ error: 'Failed to send verification email. Please try again.', detail: err.message });
  }
});

// Step 2: User clicks link → forward message to Nischal
app.get('/api/contact/verify/:token', async (req, res) => {
  try {
    const request = await ContactRequest.findOne({
      token: req.params.token,
      verified: false,
      expiresAt: { $gt: new Date() }
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

    // Forward the message to Nischal
    await resend.emails.send({
      from: 'Portfolio Contact <noreply@nischal-bhandari.com.np>',
      to: 'itisnischal@gmail.com',
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
                    <p style="margin:0;font-size:14px;color:#c0c0d0;line-height:1.8;">${request.message.replace(/\n/g, '<br>')}</p>
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
      `
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
    console.error('Contact verify error:', err);
    res.status(500).send('Something went wrong. Please try again.');
  }
});

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const validUser = username === process.env.ADMIN_USERNAME;
  const validPass = password === process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass)
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, message: 'Login successful' });
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ─── ADMIN ROUTES (protected) ─────────────────────────────────────────────────

// --- Projects ---
app.get('/api/admin/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/projects', authMiddleware, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/admin/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/projects/:id', authMiddleware, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Skills ---
app.get('/api/admin/skills', authMiddleware, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ type: 1, order: 1 });
    res.json(skills);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/admin/skills', authMiddleware, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/skills/:id', authMiddleware, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Certifications ---
app.get('/api/admin/certifications', authMiddleware, async (req, res) => {
  try {
    const certifications = await Certification.find().sort({ createdAt: -1 });
    res.json(certifications);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/certifications', authMiddleware, async (req, res) => {
  try {
    const cert = new Certification(req.body);
    await cert.save();
    res.status(201).json(cert);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/certifications/:id', authMiddleware, async (req, res) => {
  try {
    const cert = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    res.json(cert);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/certifications/:id', authMiddleware, async (req, res) => {
  try {
    const cert = await Certification.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    res.json({ message: 'Certification deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Content ---
app.put('/api/admin/content/:key', authMiddleware, async (req, res) => {
  try {
    const doc = await Content.findOneAndUpdate(
      { key: req.params.key },
      { $set: { value: req.body } },
      { new: true, upsert: true }
    );
    res.json(doc.value);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedDefaults();
});
