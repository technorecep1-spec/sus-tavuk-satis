import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Çeviri verileri
const translations = {
  tr: {
    // Navigation
    'nav.home': 'Ana Sayfa',
    'nav.products': 'Ürünler',
    'nav.gallery': 'Galeri',
    'nav.blog': 'Blog',
    'nav.contact': 'İletişim',
    'nav.login': 'Giriş Yap',
    'nav.register': 'Kayıt Ol',
    'nav.logout': 'Çıkış Yap',
    'nav.myOrders': 'Siparişlerim',
    'nav.adminPanel': 'Admin Paneli',
    'nav.cart': 'Sepet',
    
    // Common
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.add': 'Ekle',
    'common.search': 'Ara',
    'common.filter': 'Filtrele',
    'common.sort': 'Sırala',
    'common.price': 'Fiyat',
    'common.quantity': 'Miktar',
    'common.total': 'Toplam',
    'common.subtotal': 'Ara Toplam',
    'common.shipping': 'Kargo',
    'common.tax': 'Vergi',
    'common.discount': 'İndirim',
    'common.previous': 'Önceki',
    'common.next': 'Sonraki',
    'common.tryAgainLater': 'Lütfen daha sonra tekrar deneyin.',
    
    // Home Page
    'home.title': 'Wyandotte Süs Tavukları',
    'home.subtitle': 'Kaliteli ve Sağlıklı Süs Tavukları',
    'home.description': 'En kaliteli Wyandotte süs tavuklarını keşfedin. Sağlıklı, güzel ve dayanıklı tavuklarımızla çiftliğinizi güzelleştirin.',
    'home.cta': 'Ürünleri İncele',
    'home.featured': 'Öne Çıkan Ürünler',
    'home.latest': 'En Yeni Ürünler',
    
    // Products
    'products.title': 'Ürünlerimiz',
    'products.description': 'Geniş ürün yelpazemizden seçim yapın',
    'products.addToCart': 'Sepete Ekle',
    'products.viewDetails': 'Detayları Gör',
    'products.inStock': 'Stokta',
    'products.outOfStock': 'Stokta Yok',
    'products.price': 'Fiyat',
    'products.category': 'Kategori',
    'products.brand': 'Marka',
    'products.color': 'Renk',
    'products.age': 'Yaş',
    'products.gender': 'Cinsiyet',
    'products.allProducts': 'Tüm Ürünler',
    'products.liveBirds': 'Canlı Kuşlar',
    'products.feedSupplies': 'Yem ve Malzemeler',
    'products.equipment': 'Ekipman',
    'products.showing': 'Gösterilen',
    'products.of': 'toplam',
    'products.noProductsFound': 'Ürün bulunamadı',
    'products.tryAdjustingSearch': 'Arama veya filtre kriterlerinizi ayarlamayı deneyin.',
    
    // Cart
    'cart.title': 'Alışveriş Sepeti',
    'cart.empty': 'Sepetiniz boş',
    'cart.emptyDescription': 'Alışverişe başlamak için ürün ekleyin',
    'cart.continueShopping': 'Alışverişe Devam Et',
    'cart.removeItem': 'Ürünü Kaldır',
    'cart.updateQuantity': 'Miktarı Güncelle',
    'cart.checkout': 'Siparişi Tamamla',
    'cart.shippingInfo': 'Kargo Bilgileri',
    'cart.paymentInfo': 'Ödeme Bilgileri',
    'cart.startShopping': 'Alışverişe Başla',
    'cart.orderSummary': 'Sipariş Özeti',
    'cart.proceedToCheckout': 'Ödemeye Geç',
    
    // Contact
    'contact.title': 'İletişim',
    'contact.subtitle': 'Bizimle İletişime Geçin',
    'contact.name': 'Ad Soyad',
    'contact.email': 'E-posta',
    'contact.phone': 'Telefon',
    'contact.message': 'Mesaj',
    'contact.send': 'Mesaj Gönder',
    'contact.address': 'Adres',
    'contact.phoneNumber': 'Telefon Numarası',
    'contact.emailAddress': 'E-posta Adresi',
    'contact.getInTouch': 'İletişime Geçin',
    'contact.description': 'Wyandotte tavuk ihtiyaçlarınızda size yardımcı olmak için buradayız. Belirli ırklar, bakım tavsiyeleri arıyor veya ürünlerimiz hakkında sorularınız varsa, bizimle iletişime geçmekten çekinmeyin.',
    'contact.addressDetails': '123 Çiftlik Yolu\nKırsal İlçe, İl 12345\nTürkiye',
    'contact.sendMessage': 'Bize Mesaj Gönderin',
    'contact.subject': 'Konu',
    'contact.nameRequired': 'Ad gerekli',
    'contact.namePlaceholder': 'Adınız ve soyadınız',
    'contact.emailRequired': 'E-posta gerekli',
    'contact.emailInvalid': 'Geçersiz e-posta adresi',
    'contact.emailPlaceholder': 'ornek@email.com',
    'contact.subjectRequired': 'Konu gerekli',
    'contact.subjectPlaceholder': 'Bu ne hakkında?',
    'contact.messageRequired': 'Mesaj gerekli',
    'contact.messagePlaceholder': 'Sorgunuz hakkında daha fazla bilgi verin...',
    'contact.sending': 'Gönderiliyor...',
    'contact.messageSentSuccess': 'Mesaj başarıyla gönderildi! Yakında size dönüş yapacağız.',
    'contact.messageSentError': 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Tavuk Bakımı ve İpuçları',
    'blog.readMore': 'Devamını Oku',
    'blog.publishedOn': 'Yayınlanma Tarihi',
    'blog.author': 'Yazar',
    'blog.tags': 'Etiketler',
    'blog.relatedPosts': 'İlgili Yazılar',
    
    // Gallery
    'gallery.title': 'Galeri',
    'gallery.subtitle': 'Tavuklarımızın Fotoğrafları',
    'gallery.viewAll': 'Tümünü Gör',
    'gallery.imageAlt': 'Galeri resmi',
    
    // Auth
    'auth.login': 'Giriş Yap',
    'auth.register': 'Kayıt Ol',
    'auth.logout': 'Çıkış Yap',
    'auth.email': 'E-posta',
    'auth.password': 'Şifre',
    'auth.confirmPassword': 'Şifre Tekrar',
    'auth.name': 'Ad Soyad',
    'auth.phone': 'Telefon',
    'auth.address': 'Adres',
    'auth.forgotPassword': 'Şifremi Unuttum',
    'auth.rememberMe': 'Beni Hatırla',
    'auth.alreadyHaveAccount': 'Zaten hesabınız var mı?',
    'auth.dontHaveAccount': 'Hesabınız yok mu?',
    'auth.createAccount': 'Hesap Oluştur',
    'auth.loginHere': 'Buradan giriş yapın',
    'auth.signInToAccount': 'Hesabınıza giriş yapın',
    'auth.or': 'Veya',
    'auth.createNewAccount': 'yeni hesap oluşturun',
    'auth.emailRequired': 'E-posta gerekli',
    'auth.emailInvalid': 'Geçersiz e-posta adresi',
    'auth.emailPlaceholder': 'E-posta adresinizi girin',
    'auth.passwordRequired': 'Şifre gerekli',
    'auth.passwordMinLength': 'Şifre en az 6 karakter olmalı',
    'auth.passwordPlaceholder': 'Şifrenizi girin',
    'auth.signingIn': 'Giriş yapılıyor...',
    'auth.signIn': 'Giriş Yap',
    'auth.loginSuccess': 'Giriş başarılı!',
    'auth.loginFailed': 'Giriş başarısız',
    
    // Orders
    'orders.title': 'Siparişlerim',
    'orders.orderNumber': 'Sipariş No',
    'orders.orderDate': 'Sipariş Tarihi',
    'orders.status': 'Durum',
    'orders.total': 'Toplam',
    'orders.viewDetails': 'Detayları Gör',
    'orders.trackingNumber': 'Takip Numarası',
    'orders.shippingAddress': 'Kargo Adresi',
    'orders.billingAddress': 'Fatura Adresi',
    'orders.paymentMethod': 'Ödeme Yöntemi',
    'orders.items': 'Ürünler',
    
    // Admin
    'admin.dashboard': 'Admin Paneli',
    'admin.products': 'Ürün Yönetimi',
    'admin.orders': 'Sipariş Yönetimi',
    'admin.blog': 'Blog Yönetimi',
    'admin.gallery': 'Galeri Yönetimi',
    'admin.users': 'Kullanıcı Yönetimi',
    'admin.settings': 'Ayarlar',
    'admin.addProduct': 'Ürün Ekle',
    'admin.editProduct': 'Ürün Düzenle',
    'admin.deleteProduct': 'Ürün Sil',
    'admin.addPost': 'Yazı Ekle',
    'admin.editPost': 'Yazı Düzenle',
    'admin.deletePost': 'Yazı Sil',
    'admin.addImage': 'Resim Ekle',
    'admin.deleteImage': 'Resim Sil',
    'admin.welcomeMessage': 'Wyandotte Tavukları admin paneline hoş geldiniz',
    'admin.totalUsers': 'Toplam Kullanıcı',
    'admin.totalProducts': 'Toplam Ürün',
    'admin.totalOrders': 'Toplam Sipariş',
    'admin.totalRevenue': 'Toplam Gelir',
    'admin.blogPosts': 'Blog Yazıları',
    'admin.galleryImages': 'Galeri Resimleri',
    'admin.recentOrders': 'Son Siparişler',
    'admin.noRecentOrders': 'Son sipariş yok',
    'admin.recentUsers': 'Son Kullanıcılar',
    'admin.noRecentUsers': 'Son kullanıcı yok',
    'admin.unknownUser': 'Bilinmeyen Kullanıcı',
    'admin.quickActions': 'Hızlı İşlemler',
    'admin.manageProducts': 'Ürünleri Yönet',
    'admin.manageProductsDesc': 'Ürün ekle, düzenle veya sil',
    'admin.manageOrders': 'Siparişleri Yönet',
    'admin.manageOrdersDesc': 'Siparişleri görüntüle ve güncelle',
    'admin.manageBlog': 'Blogu Yönet',
    'admin.manageBlogDesc': 'Blog yazıları oluştur ve düzenle',
    'admin.manageGallery': 'Galeriyi Yönet',
    'admin.manageGalleryDesc': 'Resim yükle ve yönet',
    
    // Footer
    'footer.about': 'Hakkımızda',
    'footer.aboutText': 'Wyandotte süs tavukları konusunda uzmanlaşmış, kaliteli ve sağlıklı tavuklar sunan bir çiftlik.',
    'footer.quickLinks': 'Hızlı Linkler',
    'footer.contactInfo': 'İletişim Bilgileri',
    'footer.followUs': 'Bizi Takip Edin',
    'footer.copyright': 'Tüm hakları saklıdır.',
    'footer.privacyPolicy': 'Gizlilik Politikası',
    'footer.termsOfService': 'Kullanım Şartları',
    
    // Language Switcher
    'language.turkish': 'Türkçe',
    'language.english': 'English',
    'language.select': 'Dil Seçin'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.gallery': 'Gallery',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.myOrders': 'My Orders',
    'nav.adminPanel': 'Admin Panel',
    'nav.cart': 'Cart',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.total': 'Total',
    'common.subtotal': 'Subtotal',
    'common.shipping': 'Shipping',
    'common.tax': 'Tax',
    'common.discount': 'Discount',
    'common.previous': 'Previous',
    'common.next': 'Next',
    'common.tryAgainLater': 'Please try again later.',
    
    // Home Page
    'home.title': 'Wyandotte Ornamental Chickens',
    'home.subtitle': 'Quality and Healthy Ornamental Chickens',
    'home.description': 'Discover the highest quality Wyandotte ornamental chickens. Beautify your farm with our healthy, beautiful and durable chickens.',
    'home.cta': 'Explore Products',
    'home.featured': 'Featured Products',
    'home.latest': 'Latest Products',
    
    // Products
    'products.title': 'Our Products',
    'products.description': 'Choose from our wide range of products',
    'products.addToCart': 'Add to Cart',
    'products.viewDetails': 'View Details',
    'products.inStock': 'In Stock',
    'products.outOfStock': 'Out of Stock',
    'products.price': 'Price',
    'products.category': 'Category',
    'products.brand': 'Brand',
    'products.color': 'Color',
    'products.age': 'Age',
    'products.gender': 'Gender',
    'products.allProducts': 'All Products',
    'products.liveBirds': 'Live Birds',
    'products.feedSupplies': 'Feed & Supplies',
    'products.equipment': 'Equipment',
    'products.showing': 'Showing',
    'products.of': 'of',
    'products.noProductsFound': 'No products found',
    'products.tryAdjustingSearch': 'Try adjusting your search or filter criteria.',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDescription': 'Add products to start shopping',
    'cart.continueShopping': 'Continue Shopping',
    'cart.removeItem': 'Remove Item',
    'cart.updateQuantity': 'Update Quantity',
    'cart.checkout': 'Checkout',
    'cart.shippingInfo': 'Shipping Information',
    'cart.paymentInfo': 'Payment Information',
    'cart.startShopping': 'Start Shopping',
    'cart.orderSummary': 'Order Summary',
    'cart.proceedToCheckout': 'Proceed to Checkout',
    
    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': 'Get in Touch with Us',
    'contact.name': 'Full Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.address': 'Address',
    'contact.phoneNumber': 'Phone Number',
    'contact.emailAddress': 'Email Address',
    'contact.getInTouch': 'Get in Touch',
    'contact.description': 'We\'re here to help you with all your Wyandotte chicken needs. Whether you\'re looking for specific breeds, care advice, or have questions about our products, don\'t hesitate to reach out.',
    'contact.addressDetails': '123 Farm Road\nRural County, State 12345\nUnited States',
    'contact.sendMessage': 'Send us a Message',
    'contact.subject': 'Subject',
    'contact.nameRequired': 'Name is required',
    'contact.namePlaceholder': 'Your full name',
    'contact.emailRequired': 'Email is required',
    'contact.emailInvalid': 'Invalid email address',
    'contact.emailPlaceholder': 'your.email@example.com',
    'contact.subjectRequired': 'Subject is required',
    'contact.subjectPlaceholder': 'What\'s this about?',
    'contact.messageRequired': 'Message is required',
    'contact.messagePlaceholder': 'Tell us more about your inquiry...',
    'contact.sending': 'Sending...',
    'contact.messageSentSuccess': 'Message sent successfully! We\'ll get back to you soon.',
    'contact.messageSentError': 'Failed to send message. Please try again.',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Chicken Care and Tips',
    'blog.readMore': 'Read More',
    'blog.publishedOn': 'Published On',
    'blog.author': 'Author',
    'blog.tags': 'Tags',
    'blog.relatedPosts': 'Related Posts',
    
    // Gallery
    'gallery.title': 'Gallery',
    'gallery.subtitle': 'Photos of Our Chickens',
    'gallery.viewAll': 'View All',
    'gallery.imageAlt': 'Gallery image',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.phone': 'Phone',
    'auth.address': 'Address',
    'auth.forgotPassword': 'Forgot Password',
    'auth.rememberMe': 'Remember Me',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.createAccount': 'Create Account',
    'auth.loginHere': 'Login here',
    'auth.signInToAccount': 'Sign in to your account',
    'auth.or': 'Or',
    'auth.createNewAccount': 'create a new account',
    'auth.emailRequired': 'Email is required',
    'auth.emailInvalid': 'Invalid email address',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.passwordRequired': 'Password is required',
    'auth.passwordMinLength': 'Password must be at least 6 characters',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.signingIn': 'Signing in...',
    'auth.signIn': 'Sign in',
    'auth.loginSuccess': 'Login successful!',
    'auth.loginFailed': 'Login failed',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.orderNumber': 'Order Number',
    'orders.orderDate': 'Order Date',
    'orders.status': 'Status',
    'orders.total': 'Total',
    'orders.viewDetails': 'View Details',
    'orders.trackingNumber': 'Tracking Number',
    'orders.shippingAddress': 'Shipping Address',
    'orders.billingAddress': 'Billing Address',
    'orders.paymentMethod': 'Payment Method',
    'orders.items': 'Items',
    
    // Admin
    'admin.dashboard': 'Admin Panel',
    'admin.products': 'Product Management',
    'admin.orders': 'Order Management',
    'admin.blog': 'Blog Management',
    'admin.gallery': 'Gallery Management',
    'admin.users': 'User Management',
    'admin.settings': 'Settings',
    'admin.addProduct': 'Add Product',
    'admin.editProduct': 'Edit Product',
    'admin.deleteProduct': 'Delete Product',
    'admin.addPost': 'Add Post',
    'admin.editPost': 'Edit Post',
    'admin.deletePost': 'Delete Post',
    'admin.addImage': 'Add Image',
    'admin.deleteImage': 'Delete Image',
    'admin.welcomeMessage': 'Welcome to the Wyandotte Chickens admin panel',
    'admin.totalUsers': 'Total Users',
    'admin.totalProducts': 'Total Products',
    'admin.totalOrders': 'Total Orders',
    'admin.totalRevenue': 'Total Revenue',
    'admin.blogPosts': 'Blog Posts',
    'admin.galleryImages': 'Gallery Images',
    'admin.recentOrders': 'Recent Orders',
    'admin.noRecentOrders': 'No recent orders',
    'admin.recentUsers': 'Recent Users',
    'admin.noRecentUsers': 'No recent users',
    'admin.unknownUser': 'Unknown User',
    'admin.quickActions': 'Quick Actions',
    'admin.manageProducts': 'Manage Products',
    'admin.manageProductsDesc': 'Add, edit, or remove products',
    'admin.manageOrders': 'Manage Orders',
    'admin.manageOrdersDesc': 'View and update orders',
    'admin.manageBlog': 'Manage Blog',
    'admin.manageBlogDesc': 'Create and edit blog posts',
    'admin.manageGallery': 'Manage Gallery',
    'admin.manageGalleryDesc': 'Upload and manage images',
    
    // Footer
    'footer.about': 'About Us',
    'footer.aboutText': 'A farm specialized in Wyandotte ornamental chickens, offering quality and healthy chickens.',
    'footer.quickLinks': 'Quick Links',
    'footer.contactInfo': 'Contact Information',
    'footer.followUs': 'Follow Us',
    'footer.copyright': 'All rights reserved.',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.termsOfService': 'Terms of Service',
    
    // Language Switcher
    'language.turkish': 'Türkçe',
    'language.english': 'English',
    'language.select': 'Select Language'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('tr');

  // LocalStorage'dan dil tercihini yükle
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Dil değiştirildiğinde localStorage'a kaydet
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Çeviri fonksiyonu
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
