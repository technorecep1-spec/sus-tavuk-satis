const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const BlogPost = require('../models/BlogPost');
const GalleryImage = require('../models/GalleryImage');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function clearDatabase() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🔗 MongoDB connected');
    console.log('⚠️  Starting database cleanup...');
    
    // Tüm koleksiyonları temizle
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
      } else {
        console.log(`✅ ${collection.name} already empty`);
      }
    }
    
    console.log('');
    console.log('🎉 Database cleanup completed!');
    console.log('📝 All users, products, orders, blog posts, and gallery images have been removed');
    console.log('🆕 You can now register fresh accounts');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to: https://wyandottetr.onrender.com/register');
    console.log('2. Register with your email');
    console.log('3. Check email for verification');
    console.log('4. Your email will automatically have admin privileges');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Güvenlik kontrolü
console.log('⚠️  WARNING: This will delete ALL data from the database!');
console.log('🔄 Starting in 3 seconds...');

setTimeout(() => {
  clearDatabase();
}, 3000);
