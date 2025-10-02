const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function createAdmin() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected');
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = 'admin123'; // Varsayılan şifre
    
    if (!adminEmail) {
      console.error('ADMIN_EMAIL environment variable not set');
      process.exit(1);
    }
    
    // Admin hesabı zaten var mı kontrol et
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
      console.log('Admin status:', existingAdmin.checkAdminStatus());
      
      // E-posta doğrulanmış mı kontrol et
      if (!existingAdmin.isEmailVerified) {
        existingAdmin.isEmailVerified = true;
        await existingAdmin.save();
        console.log('Admin email verified');
      }
      
      process.exit(0);
    }
    
    // Yeni admin hesabı oluştur
    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      isEmailVerified: true, // Admin hesabı otomatik doğrulanmış
      isAdmin: false // checkAdminStatus() fonksiyonu e-posta ile kontrol eder
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login');
    console.log('🔐 Admin status:', adminUser.checkAdminStatus());
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
