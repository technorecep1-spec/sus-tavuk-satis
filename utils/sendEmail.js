// utils/sendEmail.js - SENDGRID SÜRÜMÜ

const sgMail = require('@sendgrid/mail');

// API anahtarımızı process.env'den alarak SendGrid'i başlatıyoruz
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    const msg = {
        to: options.to,
        // ÖNEMLİ: Bu e-posta adresi, SendGrid'de 2. adımda doğruladığın "Sender Identity" ile aynı olmalı
        from: 'mustafa.ozdemir.7@outlook.com', 
        subject: options.subject,
        html: options.html,
    };

    try {
        await sgMail.send(msg);
        console.log('SendGrid üzerinden e-posta başarıyla gönderildi.');
    } catch (error) {
        console.error('SendGrid e-posta gönderme hatası:', error);
        
        // Hatanın detaylarını görmek için
        if (error.response) {
            console.error(error.response.body)
        }
        // Hatayı yukarıya fırlatarak register rotasının yakalamasını sağlıyoruz
        throw error; 
    }
};

module.exports = sendEmail;