// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Transporter oluştur (e-postayı hangi sunucunun göndereceğini belirtir)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. E-posta seçeneklerini tanımla
    const mailOptions = {
        from: 'Wyandotte TR <noreply@wyandotte.com>', // Gönderen
        to: options.to, // Alıcı
        subject: options.subject, // Konu
        html: options.html // İçerik (HTML olarak)
    };

    // 3. E-postayı gönder
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;