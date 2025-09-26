// routes/productRoutes.js - TAM SÜRÜM

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { SitemapStream, streamToPromise } = require('sitemap');

// Modelleri ve Yardımcıları Dahil Etme (Yolların doğru olduğundan emin ol)
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const GalleryImage = require('../models/GalleryImage');
const sendEmail = require('../utils/sendEmail');

// -- Genel Sayfalar --
router.get('/', async (req, res) => {
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

router.get('/sitemap.xml', async (req, res) => {
    res.header('Content-Type', 'application/xml');
    try {
        const smStream = new SitemapStream({ hostname: 'https://wyandottetr.onrender.com' });
        smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        smStream.write({ url: '/urunler', changefreq: 'daily', priority: 0.9 });
        smStream.write({ url: '/iletisim', changefreq: 'monthly', priority: 0.7 });
        smStream.write({ url: '/galeri', changefreq: 'monthly', priority: 0.7 });
        const products = await Product.find({}, '_id');
        products.forEach(product => {
            smStream.write({ url: `/product/${product._id}`, changefreq: 'weekly', priority: 0.8 });
        });
        smStream.end();
        const sitemap = await streamToPromise(smStream);
        res.send(sitemap);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});
router.get('/urunler', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 8;
        const searchTerm = req.query.search || "";
        let filter = {};
        if (searchTerm) {
            filter = { $or: [{ isim: { $regex: searchTerm, $options: 'i' } }, { aciklama: { $regex: searchTerm, $options: 'i' } }] };
        }
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        const urunler = await Product.find(filter).sort({ _id: -1 }).skip((page - 1) * itemsPerPage).limit(itemsPerPage);
        res.render('urunler', { urunler, currentPage: page, totalPages, searchTerm, pageTitle: 'Ürünlerimiz - Wyandotte TR' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});
router.get('/product/:id', async (req, res) => {
    try {
        const urun = await Product.findById(req.params.id);
        if (!urun) { return res.status(404).send('Ürün bulunamadı.'); }
        const reviews = await Review.find({ product: urun._id, isApproved: true }).populate('user', 'email').sort({ createdAt: -1 });

        // --- YORUM YETKİ KONTROLÜ BAŞLANGIÇ ---
        let kullaniciYorumYapabilir = false;

        // 1. Kullanıcı giriş yapmış mı diye kontrol et
        if (req.session.user) {
            // 2. Bu kullanıcının, bu ürünü içeren ve "Teslim Edildi" durumunda bir siparişi var mı?
            const siparis = await Order.findOne({
                user: req.session.user.id,
                'products.product': urun._id,
                status: 'Teslim Edildi'
            });

            if (siparis) {
                kullaniciYorumYapabilir = true;
            }
        }
        // --- YORUM YETKİ KONTROLÜ BİTİŞ ---

        res.render('product-detail', { 
            urun, 
            reviews, 
            pageTitle: `${urun.isim} - Wyandotte TR`,
            kullaniciYorumYapabilir: kullaniciYorumYapabilir // Bu yeni bilgiyi sayfaya gönderiyoruz
        });

    } catch (err) {
        console.error("Ürün detayı getirilirken hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.get('/product/:id', async (req, res) => {
    try {
        const urun = await Product.findById(req.params.id);
        if (!urun) { return res.status(404).send('Ürün bulunamadı.'); }
        const reviews = await Review.find({ product: urun._id, isApproved: true }).populate('user', 'email').sort({ createdAt: -1 });
        res.render('product-detail', { urun, reviews, pageTitle: `${urun.isim} - Wyandotte TR` });
    } catch (err) {
        console.error("Ürün detayı getirilirken hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/product/:id/review', async (req, res) => {
    if (!req.session.user) { 
        return res.redirect('/login'); 
    }
    
    try {
        // --- YORUM YETKİ KONTROLÜ (GÜVENLİK) ---
        const siparis = await Order.findOne({
            user: req.session.user.id,
            'products.product': req.params.id,
            status: 'Teslim Edildi'
        });

        if (!siparis) {
            req.flash('error_msg', 'Yorum yapabilmek için bu ürünü satın almış ve teslim almış olmalısınız.');
            return res.redirect('/product/' + req.params.id);
        }
        // --- GÜVENLİK KONTROLÜ BİTİŞ ---

        const { rating, comment } = req.body;
        const newReview = new Review({ 
            product: req.params.id, 
            user: req.session.user.id, 
            rating, 
            comment 
        });
        await newReview.save();
        req.flash('success_msg', 'Yorumunuz onaya gönderildi. Teşekkür ederiz!');
        res.redirect('/product/' + req.params.id);

    } catch (err) {
        console.error("Yorum gönderme hatası:", err);
        req.flash('error_msg', 'Yorum gönderilirken bir hata oluştu.');
        res.status(500).send('Yorum gönderilirken bir hata oluştu.');
    }
});

router.get('/iletisim', (req, res) => {
    res.render('iletisim', { pageTitle: 'İletişim - Wyandotte TR' });
});

router.get('/galeri', async (req, res) => {
    try {
        const images = await GalleryImage.find().sort({ createdAt: -1 });
        res.render('galeri', {
            pageTitle: 'Galeri - Wyandotte TR',
            images: images
        });
    } catch (err) {
        console.error('Galeri sayfası yüklenirken hata:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/contact', async (req, res) => {
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

router.get('/my-orders', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const siparisler = await Order.find({ user: req.session.user.id }).populate('products.product').sort({ createdAt: -1 });
        // YENİ EKLENEN KISIM: Kullanıcının daha önce yaptığı tüm yorumları buluyoruz.
        const userReviews = await Review.find({ user: req.session.user.id });

        res.render('my-orders', { 
            siparisler: siparisler, 
            userReviews: userReviews, // Bu yeni bilgiyi sayfaya gönderiyoruz.
            pageTitle: 'Siparişlerim - Wyandotte TR' 
        });
    } catch (err) {
        console.error("Siparişlerim sayfası yüklenirken hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.get('/my-messages', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const conversations = await Conversation.find({ user: req.session.user.id }).sort({ updatedAt: -1 });
        res.render('my-messages', { conversations: conversations, pageTitle: 'Mesajlarım - Wyandotte TR' });
    } catch (err) {
        console.error("Mesajlarım sayfası hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.get('/account', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const user = await User.findById(req.session.user.id);
        res.render('account', { currentUser: user, pageTitle: 'Hesabım - Wyandotte TR' });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/account/details', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const { firstName, lastName, phone, address } = req.body;
        await User.findByIdAndUpdate(req.session.user.id, { firstName, lastName, phone, address });
        req.flash('success_msg', 'Profil bilgileriniz başarıyla güncellendi.');
        res.redirect('/account');
    } catch (err) {
        req.flash('error_msg', 'Bilgiler güncellenirken bir hata oluştu.');
        res.redirect('/account');
    }
});

router.post('/account/password', async (req, res) => {
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

router.get('/message/:id', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const conversation = await Conversation.findById(req.params.id).populate('messages.sender', 'email isAdmin');
        if (!conversation) { return res.status(404).send('Konuşma bulunamadı.'); }
        if (conversation.user.toString() !== req.session.user.id && !req.session.user.isAdmin) {
            return res.status(403).send('Bu sayfaya erişim yetkiniz yok.');
        }
        res.render('conversation-detail', { conversation: conversation, pageTitle: 'Mesaj Detayı' });
    } catch (err) {
        console.error("Mesaj detayı hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/message/:id/reply', async (req, res) => {
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

router.post('/cart/add', async (req, res) => {
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

router.get('/cart', (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    const cart = req.session.cart || [];
    let cartTotal = 0;
    const processedCart = cart.map(item => {
        const priceAsNumber = parseFloat(String(item.product.fiyat).replace(/[^0-9]/g, ''));
        const total = priceAsNumber * item.quantity;
        cartTotal += total;
        return { ...item, total: total };
    });
    res.render('cart', { cart: processedCart, cartTotal, pageTitle: 'Sepetim - Wyandotte TR' });
});

router.post('/cart/remove', (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    const { productId } = req.body;
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.product._id.toString() !== productId);
    }
    res.redirect('/cart');
});

router.post('/checkout', async (req, res) => {
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

router.get('/login', (req, res) => { res.render('login', { pageTitle: 'Giriş Yap - Wyandotte TR' }); });
router.get('/register', (req, res) => { res.render('register', { pageTitle: 'Kayıt Ol - Wyandotte TR' }); });
router.get('/forgot-password', (req, res) => { res.render('forgot-password', { pageTitle: 'Şifremi Unuttum - Wyandotte TR' }); });

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('success_msg', 'Eğer e-posta adresi sistemde kayıtlı ise, bir sıfırlama linki gönderildi.');
            return res.redirect('/forgot-password');
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 dakika
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

router.get('/reset-password/:token', async (req, res) => {
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
        res.render('reset-password', { token: resetToken, pageTitle: 'Şifre Sıfırla - Wyandotte TR' });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Bir hata oluştu.');
        res.redirect('/forgot-password');
    }
});

router.post('/reset-password/:token', async (req, res) => {
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

// routes/productRoutes.js dosyasındaki eski /login POST rotasıyla değiştirin

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'Geçersiz e-posta veya şifre.');
            return res.redirect('/login');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Geçersiz e-posta veya şifre.');
            return res.redirect('/login');
        }

        // --- YENİ EKLENEN KONTROL ---
        // Kullanıcı e-postasını doğrulamış mı?
        if (!user.isVerified) {
            req.flash('error_msg', 'Giriş yapmadan önce e-postanıza gönderilen link ile hesabınızı doğrulamanız gerekmektedir.');
            return res.redirect('/login');
        }
        // --- KONTROL BİTİŞ ---

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
// routes/productRoutes.js dosyasındaki eski /register POST rotasıyla değiştirin

// routes/productRoutes.js dosyasındaki /register POST rotasını bununla değiştirin

router.post('/register', async (req, res) => {
    // --- DEBUG 1: Rota çalışıyor mu? ---
    console.log('--- KAYIT POST ROTASINA ULAŞILDI! ---');
    console.log('Gelen form verisi:', req.body);

    const { firstName, lastName, email, phone, address, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            // --- DEBUG 2: Kullanıcı mevcut mu? ---
            console.log('Hata: Bu e-posta zaten mevcut:', email);
            req.flash('error_msg', 'Bu e-posta adresi zaten kullanılıyor.');
            return res.redirect('/register');
        }
        
        const isAdmin = (email === process.env.ADMIN_EMAIL);
        user = new User({ firstName, lastName, email, phone, address, password, isAdmin });
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const registerToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(registerToken).digest('hex');
        user.verificationTokenExpire = Date.now() + 10 * 60 * 1000;

        await user.save();
        
        // --- DEBUG 3: Kullanıcı kaydedildi mi? ---
        console.log('Başarılı: Yeni kullanıcı veritabanına kaydedildi:', user.email);
        
        try {
            const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${registerToken}`;
            const message = `<h1>Hesap Doğrulama</h1><p>Merhaba ${user.firstName},</p><p>Wyandotte TR hesabınızı doğrulamak için lütfen aşağıdaki linke tıklayın. Bu link 10 dakika boyunca geçerlidir.</p><a href="${verificationUrl}" clicktracking="off">${verificationUrl}</a><p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>`;

            await sendEmail({
                to: user.email,
                subject: 'Wyandotte TR - Hesabınızı Doğrulayın',
                html: message
            });

            // --- DEBUG 4: E-posta gönderildi mi? ---
            console.log('Başarılı: Doğrulama e-postası gönderildi:', user.email);

            req.flash('success_msg', 'Kayıt başarılı! Hesabınızı aktive etmek için lütfen e-postanızı kontrol edin.');
            res.redirect('/login');

        } catch (emailErr) {
            console.error('Doğrulama e-postası gönderilirken HATA:', emailErr);
            req.flash('error_msg', 'Kayıt başarılı fakat doğrulama e-postası gönderilemedi. Lütfen bizimle iletişime geçin.');
            res.redirect('/login');
        }

    } catch (err) {
        // --- DEBUG 5: Genel bir hata mı var? ---
        console.error('Register rotasında genel HATA:', err);
        req.flash('error_msg', 'Kayıt sırasında bir sunucu hatası oluştu.');
        res.redirect('/register');
    }
});
// routes/productRoutes.js dosyasının en altına, module.exports'tan önce ekle

// --- YENİ: Yorum Yapma Sayfası Rotaları ---

// Yorum yapma sayfasını GET isteği ile gösterme
router.get('/leave-review/:productId', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const productId = req.params.productId;
        const userId = req.session.user.id;

        // GÜVENLİK KONTROLÜ 1: Kullanıcı bu ürünü satın alıp teslim almış mı?
        const order = await Order.findOne({ user: userId, 'products.product': productId, status: 'Teslim Edildi' });
        if (!order) {
            req.flash('error_msg', 'Bu ürünü yorumlamak için satın alıp teslim almış olmalısınız.');
            return res.redirect('/my-orders');
        }

        // GÜVENLİK KONTROLÜ 2: Kullanıcı bu ürünü daha önce yorumlamış mı?
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            req.flash('error_msg', 'Bu ürünü zaten daha önce yorumladınız.');
            return res.redirect('/my-orders');
        }

        const product = await Product.findById(productId);
        res.render('leave-review', { product: product, pageTitle: `Değerlendir: ${product.isim}` });

    } catch (error) {
        console.error("Yorum sayfası açılırken hata:", error);
        res.redirect('/my-orders');
    }
});

// Yorum formunu POST isteği ile kaydetme
router.post('/leave-review/:productId', async (req, res) => {
    if (!req.session.user) { return res.redirect('/login'); }
    try {
        const productId = req.params.productId;
        const userId = req.session.user.id;
        const { rating, comment } = req.body;

        // GÜVENLİK KONTROLLERİNİ TEKRAR YAP (ÇOK ÖNEMLİ!)
        const order = await Order.findOne({ user: userId, 'products.product': productId, status: 'Teslim Edildi' });
        if (!order) {
            req.flash('error_msg', 'Bu ürünü yorumlamak için yetkiniz bulunmamaktadır.');
            return res.redirect('/my-orders');
        }
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            req.flash('error_msg', 'Bu ürünü zaten daha önce yorumladınız.');
            return res.redirect('/my-orders');
        }

        // Yeni yorumu oluştur ve kaydet
        const newReview = new Review({
            product: productId,
            user: userId,
            rating: rating,
            comment: comment
        });
        await newReview.save();

        req.flash('success_msg', 'Yorumunuz onaya gönderildi. Değerlendirmeniz için teşekkür ederiz!');
        res.redirect('/my-orders');

    } catch (error) {
        console.error("Yorum kaydedilirken hata:", error);
        req.flash('error_msg', 'Yorum kaydedilirken bir hata oluştu.');
        res.redirect('/my-orders');
    }
});
// routes/productRoutes.js dosyasının en altına, module.exports'tan önce ekle

// YENİ EKLENEN ROTA: E-posta Doğrulama Linki
router.get('/verify-email/:token', async (req, res) => {
    try {
        // 1. URL'den gelen ham (şifresiz) token'ı al
        const unhashedToken = req.params.token;

        // 2. Bu token'ı, veritabanındakiyle karşılaştırabilmek için aynı yöntemle şifrele
        const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');

        // 3. Veritabanında bu şifreli token'a sahip VE süresi dolmamış bir kullanıcı ara
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpire: { $gt: Date.now() } // Son kullanma tarihi şu andan büyük olmalı
        });

        // 4. Eğer böyle bir kullanıcı bulunamazsa, link geçersizdir.
        if (!user) {
            req.flash('error_msg', 'Doğrulama linki geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.');
            return res.redirect('/login');
        }

        // 5. Eğer kullanıcı bulunduysa, hesabını onayla!
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        req.flash('success_msg', 'Hesabınız başarıyla doğrulandı! Artık giriş yapabilirsiniz.');
        res.redirect('/login');

    } catch (err) {
        console.error('Hesap doğrulama sırasında hata:', err);
        req.flash('error_msg', 'Hesap doğrulanırken bir hata oluştu.');
        res.redirect('/login');
    }
});
module.exports = router;