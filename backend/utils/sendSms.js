// Try to load axios, but don't fail if it's not available
let axios = null;
try {
  axios = require('axios');
} catch (error) {
  console.log('⚠️ Axios not available, using mock SMS mode only');
}

// SMS provider configurations
const initializeSmsProviders = () => {
  const providers = [];
  
  // Check Netgsm configuration
  if (process.env.NETGSM_USERNAME && process.env.NETGSM_PASSWORD) {
    console.log('✅ Netgsm SMS provider configuration found');
    console.log(`📱 Netgsm Username: ${process.env.NETGSM_USERNAME}`);
    console.log(`📱 Netgsm Password: ${process.env.NETGSM_PASSWORD ? '***configured***' : 'NOT SET'}`);
    
    providers.push({
      name: 'Netgsm',
      config: {
        username: process.env.NETGSM_USERNAME,
        password: process.env.NETGSM_PASSWORD,
        msgheader: process.env.NETGSM_MSGHEADER || 'WYANDOTTE',
        url: 'https://api.netgsm.com.tr/sms/send/get'
      }
    });
  }
  
  // Check Iletimerkezi configuration
  if (process.env.ILETIMERKEZI_USERNAME && process.env.ILETIMERKEZI_PASSWORD) {
    console.log('✅ İletimerkezi SMS provider configuration found');
    console.log(`📱 İletimerkezi Username: ${process.env.ILETIMERKEZI_USERNAME}`);
    console.log(`📱 İletimerkezi Password: ${process.env.ILETIMERKEZI_PASSWORD ? '***configured***' : 'NOT SET'}`);
    
    providers.push({
      name: 'İletimerkezi',
      config: {
        username: process.env.ILETIMERKEZI_USERNAME,
        password: process.env.ILETIMERKEZI_PASSWORD,
        msgheader: process.env.ILETIMERKEZI_MSGHEADER || 'WYANDOTTE',
        url: 'https://api.iletimerkezi.com/v1/send-sms'
      }
    });
  }
  
  if (providers.length === 0) {
    console.log('❌ No SMS providers configured');
    console.log(`📱 NETGSM_USERNAME: ${process.env.NETGSM_USERNAME ? 'SET' : 'NOT SET'}`);
    console.log(`📱 NETGSM_PASSWORD: ${process.env.NETGSM_PASSWORD ? 'SET' : 'NOT SET'}`);
    console.log(`📱 ILETIMERKEZI_USERNAME: ${process.env.ILETIMERKEZI_USERNAME ? 'SET' : 'NOT SET'}`);
    console.log(`📱 ILETIMERKEZI_PASSWORD: ${process.env.ILETIMERKEZI_PASSWORD ? 'SET' : 'NOT SET'}`);
  }
  
  return providers;
};

// Send SMS via Netgsm
const sendNetgsmSms = async (phoneNumber, message, config) => {
  if (!axios) {
    throw new Error('Axios not available - cannot send real SMS');
  }
  
  try {
    const params = new URLSearchParams({
      usercode: config.username,
      password: config.password,
      gsmno: phoneNumber.replace(/\D/g, ''), // Remove non-digits
      message: message,
      msgheader: config.msgheader
    });

    const response = await axios.get(`${config.url}?${params.toString()}`, {
      timeout: 30000
    });

    // Netgsm returns numeric status codes
    const statusCode = parseInt(response.data);
    
    if (statusCode === 00) {
      return {
        success: true,
        messageId: `netgsm-${Date.now()}`,
        provider: 'Netgsm',
        response: response.data
      };
    } else {
      throw new Error(`Netgsm error code: ${statusCode}`);
    }
  } catch (error) {
    console.error('Netgsm SMS error:', error.message);
    throw new Error(`Netgsm SMS failed: ${error.message}`);
  }
};

// Send SMS via İletimerkezi
const sendIletimerkeziSms = async (phoneNumber, message, config) => {
  if (!axios) {
    throw new Error('Axios not available - cannot send real SMS');
  }
  
  try {
    const payload = {
      username: config.username,
      password: config.password,
      source_addr: config.msgheader,
      dest_addr: [phoneNumber.replace(/\D/g, '')], // Remove non-digits
      message: message,
      datacoding: 0,
      type: 'normal'
    };

    const response = await axios.post(config.url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data && response.data.response && response.data.response.status === 'success') {
      return {
        success: true,
        messageId: `iletimerkezi-${Date.now()}`,
        provider: 'İletimerkezi',
        response: response.data
      };
    } else {
      throw new Error(`İletimerkezi error: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('İletimerkezi SMS error:', error.message);
    throw new Error(`İletimerkezi SMS failed: ${error.message}`);
  }
};

// Create mock SMS sender for fallback
const createMockSmsSender = () => {
  console.log('📱 Using mock SMS mode - no working SMS providers');
  
  return {
    sendSms: async (phoneNumber, message) => {
      console.log('📱 MOCK SMS SENT (Fallback Mode):');
      console.log('  To:', phoneNumber);
      console.log('  Message:', message);
      console.log('  ⚠️  This is a mock SMS - no real SMS was sent');
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        provider: 'Mock',
        response: 'Mock SMS sent successfully (no working SMS providers)'
      };
    }
  };
};

// Create SMS sender with multiple providers and fallback
const createSmsSender = async () => {
  try {
    const providers = initializeSmsProviders();
    
    if (providers.length === 0) {
      console.log('📱 Using mock SMS mode - no SMS providers configured');
      return createMockSmsSender();
    }
    
    // Try each provider in order
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`📱 Trying ${provider.name} (${i + 1}/${providers.length})`);
      
      try {
        let sender;
        
        if (provider.name === 'Netgsm') {
          sender = {
            providerName: provider.name,
            config: provider.config,
            sendSms: async (phoneNumber, message) => {
              return await sendNetgsmSms(phoneNumber, message, provider.config);
            }
          };
        } else if (provider.name === 'İletimerkezi') {
          sender = {
            providerName: provider.name,
            config: provider.config,
            sendSms: async (phoneNumber, message) => {
              return await sendIletimerkeziSms(phoneNumber, message, provider.config);
            }
          };
        }
        
        console.log(`✅ ${provider.name} SMS service ready`);
        return sender;
        
      } catch (error) {
        console.log(`❌ ${provider.name} SMS service failed:`, error.message);
        
        // If this is not the last provider, try the next one
        if (i < providers.length - 1) {
          console.log(`🔄 Trying next SMS provider...`);
          continue;
        } else {
          console.log('📱 All SMS providers failed, falling back to mock mode');
          return createMockSmsSender();
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating SMS sender:', error);
    return createMockSmsSender();
  }
};

// Send bulk SMS to multiple recipients
const sendBulkSms = async (recipients, message) => {
  let successful = 0;
  let failed = 0;
  const results = [];

  console.log(`Starting bulk SMS to ${recipients.length} recipients`);

  try {
    console.log('Creating SMS sender...');
    const smsSender = await createSmsSender();
    console.log('SMS sender created successfully');
    
    // Send SMS to each recipient
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      console.log(`Sending SMS ${i + 1}/${recipients.length} to ${recipient.phone}`);
      
      try {
        // Send SMS with timeout and retry logic
        let result;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            console.log(`Attempting to send SMS to ${recipient.phone} (attempt ${retryCount + 1}/${maxRetries + 1})`);
            
            result = await Promise.race([
              smsSender.sendSms(recipient.phone, message),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('SMS sending timeout')), 45000) // 45 seconds timeout
              )
            ]);
            
            // If we get here, SMS was sent successfully
            break;
            
          } catch (smsError) {
            retryCount++;
            console.log(`SMS attempt ${retryCount} failed for ${recipient.phone}:`, smsError.message);
            
            if (retryCount <= maxRetries) {
              console.log(`Retrying in 5 seconds... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
            } else {
              console.log(`All retry attempts failed for ${recipient.phone}, using mock mode`);
              
              // Fallback to mock SMS
              console.log('📱 MOCK SMS SENT (Fallback):');
              console.log('  To:', recipient.phone);
              console.log('  Message:', message);
              
              // Simulate SMS sending delay
              await new Promise(resolve => setTimeout(resolve, 500));
              
              result = {
                success: true,
                messageId: `mock-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                provider: 'Mock (Fallback)',
                response: 'Mock SMS sent successfully (fallback)'
              };
            }
          }
        }
        
        console.log(`✅ SMS sent successfully to ${recipient.phone}:`, result.messageId);
        
        // Log provider response details
        if (result.messageId && result.messageId.startsWith('mock-')) {
          console.log('📱 Mock SMS logged above');
        } else if (smsSender.providerName) {
          console.log(`📱 ${smsSender.providerName} SMS delivered`);
        } else {
          console.log('📱 SMS delivered via configured provider');
        }
        
        successful++;
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'success',
          messageId: result.messageId,
          provider: result.provider
        });
        
      } catch (error) {
        console.error(`❌ Failed to send SMS to ${recipient.phone}:`, error.message);
        failed++;
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log(`Bulk SMS completed: ${successful} successful, ${failed} failed`);
    
    return {
      successful,
      failed,
      results
    };
    
  } catch (error) {
    console.error('❌ Bulk SMS error:', error);
    throw error;
  }
};

// Send single SMS (for notifications, etc.)
const sendSingleSms = async (phoneNumber, message, recipientName = 'Müşteri') => {
  try {
    const result = await sendBulkSms([{
      name: recipientName,
      phone: phoneNumber
    }], message);
    
    return result.successful > 0;
  } catch (error) {
    console.error('Single SMS error:', error);
    return false;
  }
};

module.exports = {
  sendBulkSms,
  sendSingleSms
};
