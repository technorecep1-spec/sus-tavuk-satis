// server.js - EKSİKSİZ TAM SÜRÜM (Sitemap ve Tüm Başlıklar Eklendi)

// 1. Gerekli Paketleri Dahil Etme
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');
const crypto = require('crypto');
const { SitemapStream, streamToPromise } = require('sitemap'); // <-- YENİ EKLENDİ
require('dotenv').config();

// Modelleri ve Yardımcıları Dahil Etme
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Message = require('./models/Message');
const Review = require('./models/Review');
const Conversation = require('./models/Conversation');
const sendEmail = require('./utils/sendEmail');

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

// 5. Rotalar

// -- Genel Sayfalar --
app.get('/', async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).limit(4);
        res.render('index', { 
            featuredProducts: featuredProducts,
            pageTitle: 'Wyandotte TR - Safkan Silver Wyandotte Süs Tavukları'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

// -- SITEMAP ROTASI (YENİ EKLENDİ) --
app.get('/sitemap.xml', async (req, res) => {
    res.header('Content-Type', 'application/xml');
    try {
        const smStream = new SitemapStream({ hostname: 'https://wyandottetr.onrender.com' });
        
        // Statik sayfaları ekle
        smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        smStream.write({ url: '/urunler', changefreq: 'daily', priority: 0.9 });
        smStream.write({ url: '/iletisim', changefreq: 'monthly', priority: 0.7 });

        // Veritabanından ürünleri çek ve sitemap'e ekle
        const products = await Product.find({}, '_id');
        products.forEach(product => {
            smStream.write({
                url: `/product/${product._id}`,
                changefreq: 'weekly',
                priority: 0.8
            });
        });

        smStream.end();

        const sitemap = await streamToPromise(smStream);
        res.send(sitemap);

    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

app.get('/urunler', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 8;
        const searchTerm = req.query.search || "";
        let filter = {};
        if (searchTerm) {
            filter = {
                $or: [
                    { isim: { $regex: searchTerm, $options: 'i' } },
                    { aciklama: { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        const urunler = await Product.find(filter)
            .sort({ _id: -1 })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);
        res.render('urunler', {
            urunler: urunler,
            currentPage: page,
            totalPages: totalPages,
            searchTerm: searchTerm,
            pageTitle: 'Ürünlerimiz - Wyandotte TR' // <-- GÜNCELLENDİ
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/product/:id', async (req, res) => {
    try {
        const urun = await Product.findById(req.params.id);
        if (!urun) { return res.status(404).send('Ürün bulunamadı.'); }
        const reviews = await Review.find({ product: urun._id, isApproved: true }).populate('user', 'email').sort({ createdAt: -1 });
        res.render('product-detail', { 
            urun: urun, 
            reviews: reviews,
            pageTitle: `${urun.isim} - Wyandotte TR` // <-- GÜNCELLENDİ
        });
    } catch (err) {
        console.error("Ürün detayı getirilirken hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/product/:id/review', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const { rating, comment } = req.body;
        const newReview = new Review({ product: req.params.id, user: req.session.user.id, rating, comment });
        await newReview.save();
        res.redirect('/product/' + req.params.id);
    } catch (err) {
        console.error("Yorum gönderme hatası:", err);
        res.status(500).send('Yorum gönderilirken bir hata oluştu.');
    }
});

app.get('/iletisim', (req, res) => {
    res.render('iletisim', { pageTitle: 'İletişim - Wyandotte TR' }); // <-- GÜNCELLENDİ
});

app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();
        req.flash('success_msg', 'Mesajınız başarıyla gönderildi!');
        res.redirect('/iletisim');
    } catch (err) {
        console.error("İletişim formu hatası:", err);
        req.flash('error_msg', 'Mesaj gönderilirken bir hata oluştu.');
        res.redirect('/iletisim');
    }
});

// -- Kullanıcıya Özel Sayfalar --
app.get('/my-orders', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const siparisler = await Order.find({ user: req.session.user.id }).populate('products.product').sort({ createdAt: -1 });
        res.render('my-orders', { siparisler: siparisler, pageTitle: 'Siparişlerim - Wyandotte TR' }); // <-- GÜNCELLENDİ
    } catch (err) {
        console.error("Siparişlerim sayfası yüklenirken hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/my-messages', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const conversations = await Conversation.find({ user: req.session.user.id }).sort({ updatedAt: -1 });
        res.render('my-messages', { conversations: conversations, pageTitle: 'Mesajlarım - Wyandotte TR' }); // <-- GÜNCELLENDİ
    } catch (err) {
        console.error("Mesajlarım sayfası hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/account', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const user = await User.findById(req.session.user.id);
        res.render('account', { currentUser: user, pageTitle: 'Hesabım - Wyandotte TR' }); // <-- GÜNCELLENDİ
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

app.post('/account/details', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const { firstName, lastName, phone, address } = req.body;
        await User.findByIdAndUpdate(req.session.user.id, {
            firstName, lastName, phone, address
        });
        req.flash('success_msg', 'Profil bilgileriniz başarıyla güncellendi.');
        res.redirect('/account');
    } catch (err) {
        req.flash('error_msg', 'Bilgiler güncellenirken bir hata oluştu.');
        res.redirect('/account');
    }
});

app.post('/account/password', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            req.flash('error_msg', 'Yeni şifreler eşleşmiyor.');
            return res.redirect('/account');
        }
        const user = await User.findById(req.session.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Mevcut şifreniz yanlış.');
            return res.redirect('/account');
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        req.flash('success_msg', 'Şifreniz başarıyla değiştirildi.');
        res.redirect('/account');
    } catch (err) {
        req.flash('error_msg', 'Şifre değiştirilirken bir hata oluştu.');
        res.redirect('/account');
    }
});

// -- Mesajlaşma Rotaları --
app.get('/message/:id', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const conversation = await Conversation.findById(req.params.id).populate('messages.sender', 'email isAdmin');
        if (!conversation) { return res.status(404).send('Konuşma bulunamadı.'); }
        if (conversation.user.toString() !== req.session.user.id && !req.session.user.isAdmin) {
            return res.status(403).send('Bu sayfaya erişim yetkiniz yok.');
        }
        res.render('conversation-detail', { conversation: conversation, pageTitle: 'Mesaj Detayı' }); // <-- GÜNCELLENDİ
    } catch (err) {
        console.error("Mesaj detayı hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/message/:id/reply', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const conversationId = req.params.id;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) { return res.status(404).send('Konuşma bulunamadı.'); }
        if (conversation.user.toString() !== req.session.user.id && !req.session.user.isAdmin) {
            return res.status(403).send('Bu işleme yetkiniz yok.');
        }
        const newMessage = { sender: req.session.user.id, content: req.body.replyContent };
        await Conversation.findByIdAndUpdate(conversationId, { $push: { messages: newMessage } });
        res.redirect('/message/' + conversationId);
    } catch (err) {
        console.error("Mesaj cevaplama hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

// -- Sepet Rotaları --
app.post('/cart/add', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product || product.stok < parseInt(quantity)) {
            return res.status(400).send('Ürün stokta yok veya yetersiz.');
        }
        if (!req.session.cart) {
            req.session.cart = [];
        }
        const cart = req.session.cart;
        const existingProductIndex = cart.findIndex(item => item.product._id.toString() === productId);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += parseInt(quantity);
        } else {
            cart.push({ product: product, quantity: parseInt(quantity) });
        }
        res.redirect(req.headers.referer || '/urunler');
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/cart', (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    const cart = req.session.cart || [];
    let cartTotal = 0;
    const processedCart = cart.map(item => {
        const priceAsNumber = parseFloat(String(item.product.fiyat).replace(/[^0-9]/g, ''));
        const total = priceAsNumber * item.quantity;
        cartTotal += total;
        return { ...item, total: total };
    });
    res.render('cart', { cart: processedCart, cartTotal: cartTotal, pageTitle: 'Sepetim - Wyandotte TR' }); // <-- GÜNCELLENDİ
});

app.post('/cart/remove', (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    const { productId } = req.body;
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.product._id.toString() !== productId);
    }
    res.redirect('/cart');
});

app.post('/checkout', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const cart = req.session.cart || [];
        if (cart.length === 0) { return res.redirect('/cart'); }
        const stockUpdatePromises = cart.map(item => {
            return Product.findByIdAndUpdate(item.product._id, { $inc: { stok: -item.quantity } });
        });
        await Promise.all(stockUpdatePromises);
        let cartTotal = 0;
        const orderProducts = cart.map(item => {
            const priceAsNumber = parseFloat(String(item.product.fiyat).replace(/[^0-9]/g, ''));
            cartTotal += priceAsNumber * item.quantity;
            return { product: item.product._id, quantity: item.quantity };
        });
        const newOrder = new Order({ user: req.session.user.id, products: orderProducts, total: cartTotal });
        await newOrder.save();
        req.session.cart = [];
        res.redirect('/my-orders');
    } catch (err) {
        console.error("Checkout sırasında hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

// -- Kullanıcı İşlemleri ve Şifre Sıfırlama Rotaları --
app.get('/login', (req, res) => { res.render('login', { pageTitle: 'Giriş Yap - Wyandotte TR' }); }); // <-- GÜNCELLENDİ
app.get('/register', (req, res) => { res.render('register', { pageTitle: 'Kayıt Ol - Wyandotte TR' }); }); // <-- GÜNCELLENDİ

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { pageTitle: 'Şifremi Unuttum - Wyandotte TR' }); // <-- GÜNCELLENDİ
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('success_msg', 'Eğer e-posta adresi sistemde kayıtlı ise, bir sıfırlama linki gönderildi.');
            return res.redirect('/forgot-password');
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        const message = `<h1>Şifre Sıfırlama Talebi</h1><p>Şifrenizi sıfırlamak için lütfen aşağıdaki linke tıklayın. Bu link 10 dakika geçerlidir.</p><a href="${resetUrl}" clicktracking="off">${resetUrl}</a>`;
        await sendEmail({ to: user.email, subject: 'Şifre Sıfırlama Linki', html: message });
        req.flash('success_msg', 'Eğer e-posta adresi sistemde kayıtlı ise, bir sıfırlama linki gönderildi.');
        res.redirect('/forgot-password');
    } catch (err) {
        console.error('Şifre sıfırlama hatası:', err);
        req.flash('success_msg', 'Eğer e-posta adresi sistemde kayıtlı ise, bir sıfırlama linki gönderildi.');
        res.redirect('/forgot-password');
    }
});

app.get('/reset-password/:token', async (req, res) => {
    try {
        const resetToken = req.params.token;
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            req.flash('error_msg', 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.');
            return res.redirect('/forgot-password');
        }
        res.render('reset-password', { token: resetToken, pageTitle: 'Şifre Sıfırla - Wyandotte TR' }); // <-- GÜNCELLENDİ
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Bir hata oluştu.');
        res.redirect('/forgot-password');
    }
});

app.post('/reset-password/:token', async (req, res) => {
    try {
        const resetToken = req.params.token;
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            req.flash('error_msg', 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.');
            return res.redirect('/forgot-password');
        }
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Şifreler eşleşmiyor.');
            return res.redirect(`/reset-password/${resetToken}`);
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        req.flash('success_msg', 'Şifreniz başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Bir hata oluştu.');
        res.redirect('/forgot-password');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) { return res.status(400).send('Geçersiz e-posta veya şifre.'); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).send('Geçersiz e-posta veya şifre.'); }
        req.session.user = { id: user._id, email: user.email, isAdmin: user.isAdmin };
        if (req.session.user.isAdmin) {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error('Login sırasında hata:', err);
        res.status(500).send('Sunucu hatası');
    }
});

app.post('/register', async (req, res) => {
    const { firstName, lastName, email, phone, address, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('Bu e-posta adresi zaten kullanılıyor.');
        }
        const isAdmin = (email === process.env.ADMIN_EMAIL);
        user = new User({
            firstName, lastName, email, phone, address, password, isAdmin
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Register sırasında hata:', err);
        res.status(500).send('Sunucu hatası');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) { return res.redirect('/'); }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// -- Admin Rotaları --
app.get('/admin', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        const urunler = await Product.find().sort({_id: -1});
        const siparisler = await Order.find().populate('user', 'email').sort({ createdAt: -1 });
        const pendingOrderCount = await Order.countDocuments({ status: 'Beklemede' });
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments({ isAdmin: false });
        const messages = await Message.find().sort({ createdAt: -1 });
        const reviews = await Review.find().populate('product', 'isim').populate('user', 'email').sort({ createdAt: -1 });
        const conversations = await Conversation.find().populate('user', 'email').sort({ updatedAt: -1 });
        const users = await User.find({ isAdmin: false }).sort({ _id: -1 });
        res.render('admin', {
            urunler, siparisler, pendingOrderCount, productCount, userCount, messages, reviews, conversations, users,
            pageTitle: 'Admin Paneli - Wyandotte TR' // <-- GÜNCELLENDİ
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/admin/add-product', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    const { isim, aciklama, fiyat, resim, stok } = req.body;
    const isFeatured = req.body.isFeatured ? true : false;
    try {
        const newProduct = new Product({ isim, aciklama, fiyat, resim, stok, isFeatured });
        await newProduct.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/admin/delete-product/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error('Ürün silinirken hata oluştu:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/admin/edit-product/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        const urun = await Product.findById(req.params.id);
        if (!urun) { return res.redirect('/admin'); }
        res.render('edit-product', { urun: urun, pageTitle: `Ürünü Düzenle: ${urun.isim}` }); // <-- GÜNCELLENDİ
    } catch (err) {
        console.error('Düzenleme sayfası yüklenirken hata:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/admin/edit-product/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        const { isim, aciklama, fiyat, resim, stok } = req.body;
        const isFeatured = req.body.isFeatured ? true : false;
        await Product.findByIdAndUpdate(req.params.id, { isim, aciklama, fiyat, resim, stok, isFeatured });
        res.redirect('/admin');
    } catch (err) {
        console.error('Ürün güncellenirken hata:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/admin/order/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        const siparis = await Order.findById(req.params.id).populate('user', 'email').populate('products.product');
        if (!siparis) { return res.redirect('/admin'); }
        res.render('order-detail', { siparis: siparis, pageTitle: `Sipariş Detayı: ${siparis._id}` }); // <-- GÜNCELLENDİ
    } catch (err) {
        console.error('Sipariş detayı getirilirken hata:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/admin/update-order-status/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        const { status: newStatus } = req.body;
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) { return res.status(404).send('Sipariş bulunamadı.'); }
        if (newStatus === 'Reddedildi' && order.status !== 'Reddedildi') {
            const stockUpdatePromises = order.products.map(item => {
                return Product.findByIdAndUpdate(item.product, { $inc: { stok: +item.quantity } });
            });
            await Promise.all(stockUpdatePromises);
        }
        await Order.findByIdAndUpdate(orderId, { status: newStatus });
        res.redirect('/admin/order/' + orderId);
    } catch (err) {
        console.error('Sipariş durumu güncellenirken hata:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/admin/review/approve/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        await Review.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.redirect('/admin');
    } catch (err) {
        console.error("Yorum onaylama hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/admin/review/delete/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error("Yorum silme hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/admin/new-message', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        const recipient = await User.findById(req.query.userId);
        if (!recipient) { return res.status(404).send('Kullanıcı bulunamadı.'); }
        res.render('new-message', {
            recipientId: recipient._id,
            recipientEmail: recipient.email,
            pageTitle: 'Yeni Mesaj Gönder' // <-- GÜNCELLENDİ
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.post('/admin/new-message', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) { return res.redirect('/login'); }
    try {
        const { userId, subject, message } = req.body;
        const newConversation = new Conversation({
            user: userId,
            subject: subject,
            messages: [{
                sender: req.session.user.id,
                content: message
            }]
        });
        await newConversation.save();
        res.redirect('/admin');
    } catch (err) {
        console.error("Mesaj gönderme hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

app.get('/admin/user/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('Kullanıcı bulunamadı.');
        }
        const orders = await Order.find({ user: user._id })
                                    .populate('products.product')
                                    .sort({ createdAt: -1 });
        
        res.render('user-detail', { 
            viewedUser: user, 
            orders: orders,
            pageTitle: `Kullanıcı Detayı: ${user.email}` // <-- GÜNCELLENDİ
        });

    } catch (err) {
        console.error("Kullanıcı detayı getirilirken hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

// 6. Sunucuyu Başlatma
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});