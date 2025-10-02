const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email verification
const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: `"Wyandotte Tavuk Çiftliği" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Hoş Geldiniz ${name}!</h2>
          <p>Wyandotte Tavuk Çiftliği'ne kayıt olduğunuz için teşekkür ederiz.</p>
          <p>Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #3498db; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              E-posta Adresimi Doğrula
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Bu link 24 saat geçerlidir. Eğer bu e-postayı siz talep etmediyseniz, lütfen göz ardı edin.
          </p>
          <p style="color: #666; font-size: 14px;">
            Link çalışmıyorsa, aşağıdaki adresi tarayıcınıza kopyalayın:<br>
            ${verificationUrl}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Wyandotte Tavuk Çiftliği" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Şifre Sıfırlama</h2>
          <p>Merhaba ${name},</p>
          <p>Şifrenizi sıfırlamak için bir talepte bulundunuz.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #e74c3c; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Şifremi Sıfırla
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Bu link 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, lütfen göz ardı edin.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
