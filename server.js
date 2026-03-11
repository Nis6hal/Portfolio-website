try { require('dotenv').config(); } catch(e) {}
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'https://nischal-bhandari.com.np',
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500'
    ];
    // Allow requests with no origin (Render health checks, Postman etc)
    if (!origin || allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  github:      { type: String, default: 'https://github.com/nis6hal' },
  demo:        { type: String, default: '#contact' },
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

const Project = mongoose.model('Project', ProjectSchema);
const Skill   = mongoose.model('Skill',   SkillSchema);
const Content = mongoose.model('Content', ContentSchema);

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
        order: 1
      },
      {
        title: 'Smart License Plate Detection',
        description: 'Edge AI system for real-time license plate recognition and automated gate control.',
        category: 'ai',
        image: 'Images/Slpd.png',
        tech: ['Python', 'OpenCV', 'TensorFlow'],
        order: 2
      },
      {
        title: 'Smart Bus Arrival Detector',
        description: 'Real-time bus tracking and ML-powered ETAs for Pokhara city routes.',
        category: 'mobile',
        image: 'Images/Sbad.png',
        tech: ['React Native', 'Firebase', 'Google Maps'],
        order: 3
      },
      {
        title: 'Portfolio Website',
        description: 'The 3D-first portfolio website you\'re currently viewing.',
        category: 'web',
        image: 'Images/Portfolio.png',
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Three.js'],
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
      { key: 'sections', value: { showGithubActivity: true, showServices: true, showFeaturedMarquee: true } }
    ]);
    console.log('✅ Default content seeded');
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
    const [projects, skills, contentDocs] = await Promise.all([
      Project.find({ visible: true }).sort({ order: 1 }),
      Skill.find().sort({ order: 1 }),
      Content.find()
    ]);
    const content = {};
    contentDocs.forEach(c => { content[c.key] = c.value; });
    res.json({ projects, skills, content });
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

// --- Content ---
app.put('/api/admin/content/:key', authMiddleware, async (req, res) => {
  try {
    const doc = await Content.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body },
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
