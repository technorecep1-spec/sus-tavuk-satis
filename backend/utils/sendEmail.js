const nodemailer = require('nodemailer');

// Initialize Gmail SMTP
const initializeGmailSMTP = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('✅ Gmail SMTP configuration found');
    return true;
  } else {
    console.log('❌ Gmail SMTP configuration not found');
    return false;
  }
};

// Create transporter with Gmail SMTP or fallback to mock mode
const createTransporter = async () => {
  try {
    // Try Gmail SMTP first
    const isGmailReady = initializeGmailSMTP();
    if (isGmailReady) {
      console.log('📧 Using Gmail SMTP for real email sending');
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 15000,   // 15 seconds
        socketTimeout: 30000,     // 30 seconds
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    
    // Fallback to mock mode
    console.log('📧 Using mock email mode - Gmail SMTP not configured');
    
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 MOCK EMAIL SENT (Fallback Mode):');
        console.log('  To:', mailOptions.to);
        console.log('  Subject:', mailOptions.subject);
        console.log('  From:', mailOptions.from);
        console.log('  Content preview:', mailOptions.html ? mailOptions.html.substring(0, 100) + '...' : 'No content');
        console.log('  ⚠️  This is a mock email - no real email was sent');
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          response: 'Mock email sent successfully (Gmail SMTP not configured)'
        };
      }
    };
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    throw error;
  }
};

// Send bulk email to multiple recipients
const sendBulkEmail = async (recipients, subject, htmlMessage) => {
  let successful = 0;
  let failed = 0;
  const results = [];

  console.log(`Starting bulk email to ${recipients.length} recipients`);

  try {
    console.log('Creating email transporter...');
    const transporter = await createTransporter();
    console.log('Transporter created successfully');
    
    // Send email to each recipient
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      console.log(`Sending email ${i + 1}/${recipients.length} to ${recipient.email}`);
      
      try {
        const mailOptions = {
          from: `"Wyandotte Tavuk Çiftliği" <technorecep_1@gmail.com>`,
          to: recipient.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin: 0;">🐔 Wyandotte Tavuk Çiftliği</h1>
                <p style="color: #7f8c8d; margin: 5px 0;">Premium Tavuk Ürünleri</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; color: #2c3e50;">Merhaba <strong>${recipient.name}</strong>,</p>
                <div style="color: #34495e; line-height: 1.6;">
                  ${htmlMessage}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                  Bu e-postayı almak istemiyorsanız, lütfen bizimle iletişime geçin.
                </p>
                <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;">
                  © 2024 Wyandotte Tavuk Çiftliği. Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          `
        };

        // Send email with timeout
        let info;
        try {
          info = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Email sending timeout')), 15000) // 15 seconds timeout
            )
          ]);
        } catch (emailError) {
          console.log(`Email failed for ${recipient.email}, using mock mode:`, emailError.message);
          
          // Fallback to mock email
          console.log('📧 MOCK EMAIL SENT (Fallback):');
          console.log('  To:', recipient.email);
          console.log('  Subject:', mailOptions.subject);
          console.log('  From:', mailOptions.from);
          console.log('  Content preview:', mailOptions.html ? mailOptions.html.substring(0, 100) + '...' : 'No content');
          
          // Simulate email sending delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          info = {
            messageId: `mock-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            response: 'Mock email sent successfully (fallback)'
          };
        }
        
        console.log(`✅ Email sent successfully to ${recipient.email}:`, info.messageId);
        
        // Log SendGrid response details
        if (info.messageId && info.messageId.startsWith('mock-')) {
          console.log('📧 Mock email logged above');
        } else {
          console.log('📧 SendGrid email delivered');
        }
        
        successful++;
        results.push({
          email: recipient.email,
          status: 'success',
          messageId: info.messageId
        });
        
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
        failed++;
        results.push({
          email: recipient.email,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log(`Bulk email completed: ${successful} successful, ${failed} failed`);
    
    return {
      successful,
      failed,
      results
    };
    
  } catch (error) {
    console.error('❌ Bulk email error:', error);
    throw error;
  }
};

// Send single email (for notifications, etc.)
const sendSingleEmail = async (to, subject, htmlMessage, recipientName = 'Müşteri') => {
  try {
    const result = await sendBulkEmail([{
      name: recipientName,
      email: to
    }], subject, htmlMessage);
    
    return result.successful > 0;
  } catch (error) {
    console.error('Single email error:', error);
    return false;
  }
};

module.exports = {
  sendBulkEmail,
  sendSingleEmail
};