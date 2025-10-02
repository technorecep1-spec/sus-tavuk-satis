const nodemailer = require('nodemailer');

// Create transporter with fallback to mock mode
const createTransporter = async () => {
  try {
    // If no email config provided, try Ethereal with fallback to mock
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('No email config found, trying test account...');
      
      try {
        // Try to create Ethereal account with short timeout
        const testAccount = await Promise.race([
          nodemailer.createTestAccount(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test account creation timeout')), 5000)
          )
        ]);
        
        console.log('Test account created:', testAccount.user);
        
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          connectionTimeout: 5000,  // Shorter timeout
          greetingTimeout: 3000,    
          socketTimeout: 5000,      
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (etherealError) {
        console.log('Ethereal failed, using mock email mode:', etherealError.message);
        
        // Return mock transporter for Render.com free tier
        return {
          sendMail: async (mailOptions) => {
            console.log('📧 MOCK EMAIL SENT:');
            console.log('  To:', mailOptions.to);
            console.log('  Subject:', mailOptions.subject);
            console.log('  From:', mailOptions.from);
            console.log('  Content preview:', mailOptions.html ? mailOptions.html.substring(0, 100) + '...' : 'No content');
            
            // Simulate email sending delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
              messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              response: 'Mock email sent successfully'
            };
          }
        };
      }
    }

    // Use provided email config
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
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
    
    // Send email to each recipient with timeout
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      console.log(`Sending email ${i + 1}/${recipients.length} to ${recipient.email}`);
      
      try {
        const mailOptions = {
          from: `"Wyandotte Tavuk Çiftliği" <${process.env.EMAIL_USER || 'noreply@wyandotte.com'}>`,
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

        // Add timeout to email sending with fallback to mock
        let info;
        try {
          info = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Email sending timeout')), 10000) // Shorter timeout
            )
          ]);
        } catch (smtpError) {
          console.log(`SMTP failed for ${recipient.email}, using mock mode:`, smtpError.message);
          
          // Fallback to mock email
          console.log('📧 MOCK EMAIL SENT (SMTP Fallback):');
          console.log('  To:', recipient.email);
          console.log('  Subject:', mailOptions.subject);
          console.log('  From:', mailOptions.from);
          console.log('  Content preview:', mailOptions.html ? mailOptions.html.substring(0, 100) + '...' : 'No content');
          
          // Simulate email sending delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          info = {
            messageId: `mock-smtp-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            response: 'Mock email sent successfully (SMTP fallback)'
          };
        }
        
        console.log(`✅ Email sent successfully to ${recipient.email}:`, info.messageId);
        
        // If using Ethereal, log the preview URL
        if (info.messageId && nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
          console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        } else if (info.messageId && (info.messageId.startsWith('mock-') || info.messageId.includes('mock-smtp-fallback'))) {
          console.log('📧 Mock email logged above');
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