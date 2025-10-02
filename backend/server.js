const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

// Trust proxy for Render.com
app.set('trust proxy', 1);

// Security middleware with CSP configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    },
  },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not found');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Found' : 'Not found');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected successfully');
  
  // Auto-clear database if CLEAR_DB environment variable is set
  if (process.env.CLEAR_DB === 'true') {
    console.log('🗑️  CLEAR_DB flag detected, clearing database...');
    
    try {
      const User = require('./models/User');
      const Product = require('./models/Product');
      const Order = require('./models/Order');
      const BlogPost = require('./models/BlogPost');
      const GalleryImage = require('./models/GalleryImage');
      
      const collections = [
        { model: User, name: 'Users' },
        { model: Product, name: 'Products' },
        { model: Order, name: 'Orders' },
        { model: BlogPost, name: 'Blog Posts' },
        { model: GalleryImage, name: 'Gallery Images' }
      ];
      
      for (const collection of collections) {
        const count = await collection.model.countDocuments();
        if (count > 0) {
          await collection.model.deleteMany({});
          console.log(`🗑️  Deleted ${count} ${collection.name}`);
        }
      }
      
      console.log('✅ Database cleared successfully!');
      console.log('📝 You can now register fresh accounts at /register');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
    }
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/admin', require('./routes/admin'));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Check if build directory exists
  const buildPath = path.join(__dirname, '../frontend/frontend/build');
  const fs = require('fs');
  
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    // Fallback: Serve temporary HTML page
    console.log('Build directory not found, serving temporary HTML page');
    app.use(express.static(path.join(__dirname, '../public')));
    
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }
} else {
  // Development mode - API only
  app.get('/', (req, res) => {
    res.json({ message: 'Wyandotte Chickens API is running!' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - Updated: ${new Date().toISOString()} - Nodemailer Fix v2`);
});
