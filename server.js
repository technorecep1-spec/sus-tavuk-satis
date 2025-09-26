// server.js - YENİ VE TEMİZ HALİ

// 1. Gerekli Paketleri Dahil Etme
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

// Route dosyalarını import et
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 2. Express Uygulamasını Başlatma ve Port Belirleme
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Veritabanına Bağlanma
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB bağlantısı başarılı...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
connectDB();

// 4. Express Ayarları ve Middleware'ler
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'bu-benim-cok-gizli-anahtarim-kimse-bilmesin',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.formatPrice = (price) => {
        if (price === null || price === undefined) return '0 ₺';
        const number = parseFloat(String(price).replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (isNaN(number)) return String(price);
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(number);
    };
    next();
});

// 5. Rotaları Kullanma
app.use('/', productRoutes);        // Genel ve kullanıcı rotaları
app.use('/admin', adminRoutes);     // Admin paneli rotaları

// 6. Sunucuyu Başlatma
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});