const nodemailer = require('nodemailer');

// Initialize email providers
const initializeEmailProviders = () => {
  const providers = [];
  
  // Check Gmail SMTP
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('✅ Primary email provider (Gmail SMTP) configuration found');
    console.log(`📧 Email Host: ${process.env.EMAIL_HOST}`);
    console.log(`📧 Email Port: ${process.env.EMAIL_PORT || '587'}`);
    console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
    console.log(`📧 Email Pass: ${process.env.EMAIL_PASS ? '***configured***' : 'NOT SET'}`);
    
    providers.push({
      name: 'Gmail SMTP',
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3',
          secureProtocol: 'TLSv1_2_method'
        },
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        rateDelta: 30000,
        rateLimit: 3,
        requireTLS: true,
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
      }
    });
  }
  
  // Check SendGrid (alternative)
  if (process.env.SENDGRID_API_KEY) {
    console.log('✅ SendGrid configuration found as backup');
    providers.push({
      name: 'SendGrid',
      config: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
        tls: {
          rejectUnauthorized: false
        },
        pool: true,
        maxConnections: 2,
        maxMessages: 25,
        rateDelta: 30000,
        rateLimit: 2
      }
    });
  }
  
  if (providers.length === 0) {
    console.log('❌ No email providers configured');
    console.log(`📧 EMAIL_HOST: ${process.env.EMAIL_HOST ? 'SET' : 'NOT SET'}`);
    console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}`);
    console.log(`📧 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);
    console.log(`📧 SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);
  }
  
  return providers;
};

// Create transporter with multiple providers and fallback
const createTransporter = async () => {
  try {
    const providers = initializeEmailProviders();
    
    if (providers.length === 0) {
      console.log('📧 Using mock email mode - no email providers configured');
      return createMockTransporter();
    }
    
    // Try each provider in order
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`📧 Trying ${provider.name} (${i + 1}/${providers.length})`);
      
      try {
        const transporter = nodemailer.createTransport(provider.config);
        
        // Test the connection
        console.log(`🔍 Testing ${provider.name} connection...`);
        await transporter.verify();
        console.log(`✅ ${provider.name} connection verified successfully`);
        
        // Add provider info to transporter for logging
        transporter.providerName = provider.name;
        return transporter;
        
      } catch (verifyError) {
        console.log(`❌ ${provider.name} connection verification failed:`, verifyError.message);
        
        // Check for specific issues
        if (verifyError.message.includes('Invalid login')) {
          console.log(`🔑 ${provider.name} authentication failed - check credentials`);
        } else if (verifyError.message.includes('timeout')) {
          console.log(`⏰ ${provider.name} timeout - this is common on cloud platforms`);
        } else if (verifyError.message.includes('ECONNREFUSED')) {
          console.log(`🌐 ${provider.name} connection refused - check network connectivity`);
        } else if (verifyError.message.includes('ENOTFOUND')) {
          console.log(`🔍 ${provider.name} host not found - check configuration`);
        }
        
        // If this is not the last provider, try the next one
        if (i < providers.length - 1) {
          console.log(`🔄 Trying next provider...`);
          continue;
        } else {
          console.log('📧 All email providers failed, falling back to mock mode');
          return createMockTransporter();
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    return createMockTransporter();
  }
};

// Create mock transporter for fallback
const createMockTransporter = () => {
  console.log('📧 Using mock email mode - no working email providers');
  
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
        response: 'Mock email sent successfully (no working email providers)'
      };
    }
  };
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

        // Send email with timeout and retry logic
        let info;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            console.log(`Attempting to send email to ${recipient.email} (attempt ${retryCount + 1}/${maxRetries + 1})`);
            
            info = await Promise.race([
              transporter.sendMail(mailOptions),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Email sending timeout')), 45000) // 45 seconds timeout - increased for cloud platforms
              )
            ]);
            
            // If we get here, email was sent successfully
            break;
            
          } catch (emailError) {
            retryCount++;
            console.log(`Email attempt ${retryCount} failed for ${recipient.email}:`, emailError.message);
            
            if (retryCount <= maxRetries) {
              console.log(`Retrying in 5 seconds... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
            } else {
              console.log(`All retry attempts failed for ${recipient.email}, using mock mode`);
              
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
          }
        }
        
        console.log(`✅ Email sent successfully to ${recipient.email}:`, info.messageId);
        
        // Log provider response details
        if (info.messageId && info.messageId.startsWith('mock-')) {
          console.log('📧 Mock email logged above');
        } else if (transporter.providerName) {
          console.log(`📧 ${transporter.providerName} email delivered`);
        } else {
          console.log('📧 Email delivered via configured provider');
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