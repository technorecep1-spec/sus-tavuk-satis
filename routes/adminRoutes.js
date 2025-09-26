// routes/adminRoutes.js - TAM SÜRÜM

const express = require('express');
const router = express.Router();

// Modelleri Dahil Etme
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const GalleryImage = require('../models/GalleryImage');

// Admin yetki kontrolü için bir middleware
const ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    req.flash('error_msg', 'Bu sayfaya erişim yetkiniz yok.');
    res.redirect('/login');
};

// Tüm admin rotaları bu middleware'i kullansın
router.use(ensureAdmin);

// -- Admin Rotaları --
router.get('/', async (req, res) => {
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
        const galleryImages = await GalleryImage.find().sort({ createdAt: -1 });
        res.render('admin', {
            urunler, siparisler, pendingOrderCount, productCount, userCount, messages, reviews, conversations, users,
            galleryImages: galleryImages,
            pageTitle: 'Admin Paneli - Wyandotte TR'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/add-product', async (req, res) => {
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

router.get('/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error('Ürün silinirken hata oluştu:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.get('/edit-product/:id', async (req, res) => {
    try {
        const urun = await Product.findById(req.params.id);
        if (!urun) { return res.redirect('/admin'); }
        res.render('edit-product', { urun: urun, pageTitle: `Ürünü Düzenle: ${urun.isim}` });
    } catch (err) {
        console.error('Düzenleme sayfası yüklenirken hata:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/edit-product/:id', async (req, res) => {
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

router.post('/gallery/add', async (req, res) => {
    try {
        const { imageUrl, title } = req.body;
        const newImage = new GalleryImage({ imageUrl, title });
        await newImage.save();
        req.flash('success_msg', 'Resim galeriye başarıyla eklendi.');
        res.redirect('/admin');
    } catch (err) {
        console.error('Galeriye resim eklenirken hata:', err);
        req.flash('error_msg', 'Resim eklenirken bir hata oluştu.');
        res.redirect('/admin');
    }
});

router.get('/gallery/delete/:id', async (req, res) => {
    try {
        await GalleryImage.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Resim galeriden başarıyla silindi.');
        res.redirect('/admin');
    } catch (err) {
        console.error('Galeriden resim silinirken hata:', err);
        req.flash('error_msg', 'Resim silinirken bir hata oluştu.');
        res.redirect('/admin');
    }
});

router.get('/order/:id', async (req, res) => {
    try {
        const siparis = await Order.findById(req.params.id).populate('user', 'email').populate('products.product');
        if (!siparis) { return res.redirect('/admin'); }
        res.render('order-detail', { siparis: siparis, pageTitle: `Sipariş Detayı: ${siparis._id}` });
    } catch (err) {
        console.error('Sipariş detayı getirilirken hata:', err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/update-order-status/:id', async (req, res) => {
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

router.post('/review/approve/:id', async (req, res) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.redirect('/admin');
    } catch (err) {
        console.error("Yorum onaylama hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/review/delete/:id', async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error("Yorum silme hatası:", err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.get('/new-message', async (req, res) => {
    try {
        const recipient = await User.findById(req.query.userId);
        if (!recipient) { return res.status(404).send('Kullanıcı bulunamadı.'); }
        res.render('new-message', {
            recipientId: recipient._id,
            recipientEmail: recipient.email,
            pageTitle: 'Yeni Mesaj Gönder'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
});

router.post('/new-message', async (req, res) => {
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

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('Kullanıcı bulunamadı.');
        }
        const orders = await Order.find({ user: user._id }).populate('products.product').sort({ createdAt: -1 });
        res.render('user-detail', {
            viewedUser: user,
            orders: orders,
            pageTitle: `Kullanıcı Detayı: ${user.email}`
        });
    } catch (err) {
        console.error("Kullanıcı detayı getirilirken hata:", err);
        res.status(500).send('Sunucu Hatası');
    }
});


module.exports = router;