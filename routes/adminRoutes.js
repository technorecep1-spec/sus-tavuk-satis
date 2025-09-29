// routes/adminRoutes.js - TAM SÜRÜM

const express = require('express');
const router = express.Router();

// Modelleri Dahil Etme
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const GalleryImage = require('../models/GalleryImage');
const sendEmail = require('../utils/sendEmail');

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
        const siparisler = await Order.find().populate('user', 'email').populate('products.product', 'isim fiyat').sort({ createdAt: -1 });
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
    const { isim, aciklama, fiyat, resim, stok, isFeaturedAdd } = req.body;
    const isFeatured = isFeaturedAdd === 'on' || isFeaturedAdd === true;
    try {
        const newProduct = new Product({ isim, aciklama, fiyat, resim, stok, isFeatured });
        await newProduct.save();
        res.json({ success: true, message: 'Ürün başarıyla eklendi!' });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Ürün eklenirken hata oluştu!' });
    }
});

router.delete('/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Ürün başarıyla silindi!' });
    } catch (err) {
        console.error('Ürün silinirken hata oluştu:', err);
        res.json({ success: false, message: 'Ürün silinirken hata oluştu!' });
    }
});

router.get('/get-product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.json({ success: false, message: 'Ürün bulunamadı!' });
        }
        res.json({ success: true, product });
    } catch (err) {
        console.error('Ürün getirilirken hata:', err);
        res.json({ success: false, message: 'Ürün getirilirken hata oluştu!' });
    }
});

router.put('/update-product/:id', async (req, res) => {
    try {
        const { isim, aciklama, fiyat, resim, stok, isFeatured } = req.body;
        await Product.findByIdAndUpdate(req.params.id, { 
            isim, aciklama, fiyat, resim, stok, 
            isFeatured: isFeatured === 'on' || isFeatured === true 
        });
        res.json({ success: true, message: 'Ürün başarıyla güncellendi!' });
    } catch (err) {
        console.error('Ürün güncellenirken hata:', err);
        res.json({ success: false, message: 'Ürün güncellenirken hata oluştu!' });
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
        // JSON response için header set et
        res.setHeader('Content-Type', 'application/json');
        
        // req.body kontrolü
        if (!req.body) {
            console.error('req.body is undefined');
            return res.json({ success: false, message: 'Request body alınamadı!' });
        }
        
        const { isim, aciklama, fiyat, resim, stok, kategori, isFeatured } = req.body;
        
        // Debug için request body'yi logla
        console.log('Edit Product Request Body:', req.body);
        
        // Validation
        if (!isim || !aciklama || !fiyat || !resim) {
            return res.json({ success: false, message: 'Gerekli alanlar eksik!' });
        }
        
        const updateData = {
            isim: String(isim).trim(),
            aciklama: String(aciklama).trim(),
            fiyat: String(fiyat).trim(),
            resim: String(resim).trim(),
            stok: parseInt(stok) || 0,
            kategori: String(kategori || 'tavuk').trim(),
            isFeatured: isFeatured === 'on' || isFeatured === true || isFeatured === 'true'
        };
        
        console.log('Update Data:', updateData);
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
            return res.json({ success: false, message: 'Ürün bulunamadı!' });
        }
        
        console.log('Product updated successfully:', updatedProduct._id);
        res.json({ success: true, message: 'Ürün başarıyla güncellendi!', product: updatedProduct });
        
    } catch (err) {
        console.error('Ürün güncellenirken hata:', err);
        console.error('Hata detayları:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        
        // JSON response için header set et
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, message: `Ürün güncellenirken hata oluştu: ${err.message}` });
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

router.get('/get-order/:id', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        console.log('Getting order details for ID:', req.params.id);
        
        const siparis = await Order.findById(req.params.id)
            .populate('user', 'email')
            .populate('products.product', 'isim fiyat');
            
        console.log('Order found:', siparis ? 'Yes' : 'No');
        
        if (!siparis) {
            console.log('Order not found for ID:', req.params.id);
            return res.json({ success: false, message: 'Sipariş bulunamadı!' });
        }
        
        console.log('Order details:', {
            id: siparis._id,
            user: siparis.user ? siparis.user.email : 'No user',
            products: siparis.products.length,
            total: siparis.total,
            status: siparis.status
        });
        
        res.json({ success: true, order: siparis });
    } catch (err) {
        console.error('Sipariş getirilirken hata:', err);
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        res.json({ success: false, message: `Sipariş getirilirken hata oluştu: ${err.message}` });
    }
});

router.post('/update-order-status/:id', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        const { status: newStatus, rejectionReason } = req.body;
        const orderId = req.params.id;
        
        if (!newStatus) {
            return res.json({ success: false, message: 'Durum belirtilmedi!' });
        }
        
        // Reddedildi seçildiyse sebep kontrolü
        if (newStatus === 'Reddedildi' && (!rejectionReason || rejectionReason.trim() === '')) {
            return res.json({ success: false, message: 'Sipariş reddedildiğinde sebep açıklaması zorunludur!' });
        }
        
        const order = await Order.findById(orderId);
        if (!order) { 
            return res.json({ success: false, message: 'Sipariş bulunamadı!' }); 
        }
        
        // Stok güncelleme (sipariş reddedilirse)
        if (newStatus === 'Reddedildi' && order.status !== 'Reddedildi') {
            const stockUpdatePromises = order.products.map(item => {
                return Product.findByIdAndUpdate(item.product, { $inc: { stok: +item.quantity } });
            });
            await Promise.all(stockUpdatePromises);
        }
        
        // Güncelleme verisi hazırla
        const updateData = { status: newStatus };
        if (newStatus === 'Reddedildi' && rejectionReason) {
            updateData.rejectionReason = rejectionReason.trim();
        } else if (newStatus !== 'Reddedildi') {
            // Reddedildi değilse reddetme sebebini temizle
            updateData.rejectionReason = '';
        }
        
        await Order.findByIdAndUpdate(orderId, updateData);
        
        // Bildirim oluştur ve e-posta gönder
        if (newStatus === 'Reddedildi') {
            await createOrderRejectionNotification(order, rejectionReason);
            await sendOrderRejectionEmail(order, rejectionReason);
        } else if (newStatus === 'Onaylandı') {
            await createOrderApprovalNotification(order);
            await sendOrderApprovalEmail(order);
        } else if (newStatus === 'Kargoda') {
            await createOrderShippedNotification(order);
            await sendOrderShippedEmail(order);
        } else if (newStatus === 'Teslim Edildi') {
            await createOrderDeliveredNotification(order);
            await sendOrderDeliveredEmail(order);
        }
        
        // Başarı mesajı
        let successMessage = 'Sipariş durumu güncellendi!';
        if (newStatus === 'Reddedildi') {
            successMessage = 'Sipariş reddedildi ve müşteriye bildirim gönderildi!';
        } else if (['Onaylandı', 'Kargoda', 'Teslim Edildi'].includes(newStatus)) {
            successMessage = `Sipariş ${newStatus.toLowerCase()} olarak işaretlendi ve müşteriye bildirim gönderildi!`;
        }
        
        res.json({ success: true, message: successMessage });
        
    } catch (err) {
        console.error('Sipariş durumu güncellenirken hata:', err);
        res.json({ success: false, message: `Sipariş durumu güncellenirken hata oluştu: ${err.message}` });
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

// API Routes for AJAX calls
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'user',
                select: 'email firstName lastName',
                options: { strictPopulate: false }
            })
            .populate('products.product', 'isim fiyat')
            .sort({ createdAt: -1 });
        
        
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Siparişler getirilirken hata:', err);
        res.json({ success: false, message: 'Siparişler getirilirken hata oluştu!' });
    }
});

router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (err) {
        console.error('Mesajlar getirilirken hata:', err);
        res.json({ success: false, message: 'Mesajlar getirilirken hata oluştu!' });
    }
});

// Mesajı okundu olarak işaretle
router.post('/mark-message-read/:id', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        const message = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!message) {
            return res.json({ success: false, message: 'Mesaj bulunamadı!' });
        }
        
        res.json({ success: true, message: 'Mesaj okundu olarak işaretlendi!' });
    } catch (err) {
        console.error('Mesaj işaretlenirken hata:', err);
        res.json({ success: false, message: 'Mesaj işaretlenirken hata oluştu!' });
    }
});

// Tüm mesajları okundu olarak işaretle
router.post('/mark-all-messages-read', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        await Message.updateMany({}, { isRead: true });
        res.json({ success: true, message: 'Tüm mesajlar okundu olarak işaretlendi!' });
    } catch (err) {
        console.error('Mesajlar işaretlenirken hata:', err);
        res.json({ success: false, message: 'Mesajlar işaretlenirken hata oluştu!' });
    }
});

// Mesaj sil
router.delete('/delete-message/:id', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.json({ success: false, message: 'Mesaj bulunamadı!' });
        }
        
        res.json({ success: true, message: 'Mesaj silindi!' });
    } catch (err) {
        console.error('Mesaj silinirken hata:', err);
        res.json({ success: false, message: 'Mesaj silinirken hata oluştu!' });
    }
});

// Seçili mesajları sil
router.delete('/delete-messages', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        const { messageIds } = req.body;
        if (!messageIds || !Array.isArray(messageIds)) {
            return res.json({ success: false, message: 'Geçersiz mesaj ID listesi!' });
        }
        
        const result = await Message.deleteMany({ _id: { $in: messageIds } });
        res.json({ success: true, message: `${result.deletedCount} mesaj silindi!` });
    } catch (err) {
        console.error('Mesajlar silinirken hata:', err);
        res.json({ success: false, message: 'Mesajlar silinirken hata oluştu!' });
    }
});

// Test mesajı ekle
router.post('/add-message', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        const { name, email, subject, message, isRead } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.json({ success: false, message: 'Tüm alanlar zorunludur!' });
        }
        
        const newMessage = new Message({
            name,
            email,
            subject,
            message,
            isRead: isRead || false
        });
        
        await newMessage.save();
        res.json({ success: true, message: 'Mesaj eklendi!', data: newMessage });
    } catch (err) {
        console.error('Mesaj eklenirken hata:', err);
        res.json({ success: false, message: 'Mesaj eklenirken hata oluştu!' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).sort({ createdAt: -1 });
        
        
        // Her kullanıcı için sipariş sayısını hesapla
        const usersWithOrderCount = await Promise.all(users.map(async (user) => {
            const orderCount = await Order.countDocuments({ user: user._id });
            return {
                ...user.toObject(),
                orderCount: orderCount
            };
        }));
        
        res.json({ success: true, users: usersWithOrderCount });
    } catch (err) {
        console.error('Kullanıcılar getirilirken hata:', err);
        res.json({ success: false, message: 'Kullanıcılar getirilirken hata oluştu!' });
    }
});

// Kullanıcı durumu değiştirme endpoint'i
router.post('/users/toggle-status', async (req, res) => {
    try {
        const { userId, isVerified } = req.body;
        
        if (!userId || typeof isVerified !== 'boolean') {
            return res.json({ success: false, message: 'Geçersiz veri!' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'Kullanıcı bulunamadı!' });
        }
        
        // Admin kullanıcıları değiştirilemez
        if (user.isAdmin) {
            return res.json({ success: false, message: 'Admin kullanıcıların durumu değiştirilemez!' });
        }
        
        user.isVerified = isVerified;
        await user.save();
        
        res.json({ success: true, message: `Kullanıcı ${isVerified ? 'aktif' : 'pasif'} yapıldı!` });
    } catch (err) {
        console.error('Kullanıcı durumu güncellenirken hata:', err);
        res.json({ success: false, message: 'Kullanıcı durumu güncellenirken hata oluştu!' });
    }
});

// Kullanıcı detay endpoint'i
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'Kullanıcı bulunamadı!' });
        }
        
        // Kullanıcının siparişlerini getir
        const orders = await Order.find({ user: userId })
            .populate('products.product', 'isim fiyat')
            .sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            user: user,
            orders: orders
        });
    } catch (err) {
        console.error('Kullanıcı detayı getirilirken hata:', err);
        res.json({ success: false, message: 'Kullanıcı detayı getirilirken hata oluştu!' });
    }
});

router.get('/gallery', async (req, res) => {
    try {
        const images = await GalleryImage.find().sort({ createdAt: -1 });
        res.json({ success: true, images });
    } catch (err) {
        console.error('Galeri getirilirken hata:', err);
        res.json({ success: false, message: 'Galeri getirilirken hata oluştu!' });
    }
});

// Bildirim ve E-posta Fonksiyonları

// Sipariş Reddetme Bildirimi
async function createOrderRejectionNotification(order, rejectionReason) {
    try {
        const notification = new Notification({
            user: order.user,
            type: 'order_rejected',
            title: 'Siparişiniz Reddedildi',
            message: `Siparişiniz reddedilmiştir. Sebep: ${rejectionReason}`,
            orderId: order._id
        });
        await notification.save();
        console.log('✅ Reddetme bildirimi oluşturuldu:', notification._id);
        console.log('📧 E-posta gönderiliyor:', order.user);
    } catch (error) {
        console.error('Reddetme bildirimi oluşturulurken hata:', error);
    }
}

// Sipariş Onaylama Bildirimi
async function createOrderApprovalNotification(order) {
    try {
        const notification = new Notification({
            user: order.user,
            type: 'order_approved',
            title: 'Siparişiniz Onaylandı',
            message: 'Siparişiniz başarıyla onaylanmıştır. En kısa sürede hazırlanmaya başlanacaktır.',
            orderId: order._id
        });
        await notification.save();
        console.log('Onaylama bildirimi oluşturuldu:', notification._id);
    } catch (error) {
        console.error('Onaylama bildirimi oluşturulurken hata:', error);
    }
}

// Sipariş Kargoya Verilme Bildirimi
async function createOrderShippedNotification(order) {
    try {
        const notification = new Notification({
            user: order.user,
            type: 'order_shipped',
            title: 'Siparişiniz Kargoya Verildi',
            message: 'Siparişiniz kargoya verilmiştir. Kargo takip numarası ile takip edebilirsiniz.',
            orderId: order._id
        });
        await notification.save();
        console.log('Kargo bildirimi oluşturuldu:', notification._id);
    } catch (error) {
        console.error('Kargo bildirimi oluşturulurken hata:', error);
    }
}

// Sipariş Teslim Edilme Bildirimi
async function createOrderDeliveredNotification(order) {
    try {
        const notification = new Notification({
            user: order.user,
            type: 'order_delivered',
            title: 'Siparişiniz Teslim Edildi',
            message: 'Siparişiniz başarıyla teslim edilmiştir. Teşekkür ederiz!',
            orderId: order._id
        });
        await notification.save();
        console.log('Teslim bildirimi oluşturuldu:', notification._id);
    } catch (error) {
        console.error('Teslim bildirimi oluşturulurken hata:', error);
    }
}

// E-posta Gönderim Fonksiyonları

// Sipariş Reddetme E-postası
async function sendOrderRejectionEmail(order, rejectionReason) {
    try {
        const user = await User.findById(order.user);
        if (!user || !user.email) return;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #dc3545; margin: 0;">Siparişiniz Reddedildi</h2>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #dee2e6;">
                    <p>Merhaba ${user.name || 'Değerli Müşterimiz'},</p>
                    
                    <p>Üzgünüz, ancak siparişiniz aşağıdaki sebeple reddedilmiştir:</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <strong>Reddetme Sebebi:</strong><br>
                        ${rejectionReason}
                    </div>
                    
                    <p>Herhangi bir sorunuz varsa lütfen bizimle iletişime geçin.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/iletisim" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">İletişime Geç</a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>Teşekkür ederiz.</p>
                    <p><strong>Sus Tavuk Satış</strong></p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Siparişiniz Reddedildi - Sus Tavuk Satış',
            html: emailHtml
        });

        console.log('✅ Reddetme e-postası başarıyla gönderildi:', user.email);
        console.log('📋 Reddetme sebebi:', rejectionReason);
    } catch (error) {
        console.error('Reddetme e-postası gönderilirken hata:', error);
    }
}

// Sipariş Onaylama E-postası
async function sendOrderApprovalEmail(order) {
    try {
        const user = await User.findById(order.user);
        if (!user || !user.email) return;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #d4edda; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #155724; margin: 0;">Siparişiniz Onaylandı!</h2>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #dee2e6;">
                    <p>Merhaba ${user.name || 'Değerli Müşterimiz'},</p>
                    
                    <p>Harika haber! Siparişiniz başarıyla onaylanmıştır.</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Sipariş Detayları:</strong><br>
                        Sipariş No: ${order._id}<br>
                        Toplam Tutar: ₺${order.total}<br>
                        Durum: Onaylandı
                    </div>
                    
                    <p>Siparişiniz en kısa sürede hazırlanmaya başlanacaktır. Güncellemeler için bizi takip edebilirsiniz.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/my-orders" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Siparişlerimi Görüntüle</a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>Teşekkür ederiz.</p>
                    <p><strong>Sus Tavuk Satış</strong></p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Siparişiniz Onaylandı - Sus Tavuk Satış',
            html: emailHtml
        });

        console.log('Onaylama e-postası gönderildi:', user.email);
    } catch (error) {
        console.error('Onaylama e-postası gönderilirken hata:', error);
    }
}

// Sipariş Kargoya Verilme E-postası
async function sendOrderShippedEmail(order) {
    try {
        const user = await User.findById(order.user);
        if (!user || !user.email) return;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #cce5ff; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #004085; margin: 0;">Siparişiniz Kargoya Verildi!</h2>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #dee2e6;">
                    <p>Merhaba ${user.name || 'Değerli Müşterimiz'},</p>
                    
                    <p>Müjde! Siparişiniz kargoya verilmiştir.</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Sipariş Detayları:</strong><br>
                        Sipariş No: ${order._id}<br>
                        Toplam Tutar: ₺${order.total}<br>
                        Durum: Kargoda
                    </div>
                    
                    <p>Kargo takip numaranız ile siparişinizi takip edebilirsiniz. Teslimat süresi 1-3 iş günüdür.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/my-orders" style="background: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Siparişlerimi Görüntüle</a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>Teşekkür ederiz.</p>
                    <p><strong>Sus Tavuk Satış</strong></p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Siparişiniz Kargoya Verildi - Sus Tavuk Satış',
            html: emailHtml
        });

        console.log('Kargo e-postası gönderildi:', user.email);
    } catch (error) {
        console.error('Kargo e-postası gönderilirken hata:', error);
    }
}

// Sipariş Teslim Edilme E-postası
async function sendOrderDeliveredEmail(order) {
    try {
        const user = await User.findById(order.user);
        if (!user || !user.email) return;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #0c5460; margin: 0;">Siparişiniz Teslim Edildi!</h2>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #dee2e6;">
                    <p>Merhaba ${user.name || 'Değerli Müşterimiz'},</p>
                    
                    <p>Harika! Siparişiniz başarıyla teslim edilmiştir.</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Sipariş Detayları:</strong><br>
                        Sipariş No: ${order._id}<br>
                        Toplam Tutar: ₺${order.total}<br>
                        Durum: Teslim Edildi
                    </div>
                    
                    <p>Ürünlerimizi beğendiyseniz, lütfen değerlendirmenizi yapmayı unutmayın!</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/my-orders" style="background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Siparişlerimi Görüntüle</a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>Teşekkür ederiz.</p>
                    <p><strong>Sus Tavuk Satış</strong></p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Siparişiniz Teslim Edildi - Sus Tavuk Satış',
            html: emailHtml
        });

        console.log('Teslim e-postası gönderildi:', user.email);
    } catch (error) {
        console.error('Teslim e-postası gönderilirken hata:', error);
    }
}

module.exports = router;