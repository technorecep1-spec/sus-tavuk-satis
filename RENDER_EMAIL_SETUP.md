# Email Configuration for Render.com Deployment

## Gmail SMTP Setup for Production

### 1. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `EMAIL_PASS`

### 2. Environment Variables for Render.com

Set these environment variables in your Render.com dashboard:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password

# Other required variables
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
ADMIN_EMAIL=admin@yourdomain.com
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.onrender.com
```

### 3. Common Issues and Solutions

#### Issue: "Email sending timeout"
- **Cause**: Gmail SMTP is slow on cloud platforms
- **Solution**: The code now includes increased timeouts and retry logic

#### Issue: "Invalid login"
- **Cause**: Wrong credentials or 2FA not enabled
- **Solution**: Use App Password, not regular password

#### Issue: "Connection refused"
- **Cause**: Network issues or wrong port
- **Solution**: Use port 587 (not 465) for Render.com

### 4. Testing Email Functionality

1. Deploy your application to Render.com
2. Go to Admin Panel → Email Management
3. Send a test email to yourself
4. Check Render.com logs for detailed error messages

### 5. Alternative Email Services

If Gmail SMTP continues to have issues, consider:

#### SendGrid (Recommended)
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASS=your-mailgun-smtp-password
```

### 6. Monitoring Email Delivery

The application now includes:
- ✅ Connection verification before sending
- ✅ Retry logic (3 attempts)
- ✅ Detailed error logging
- ✅ Fallback to mock mode if SMTP fails
- ✅ Increased timeouts for cloud platforms

### 7. Troubleshooting

Check Render.com logs for:
- `✅ Gmail SMTP configuration found` - Configuration is loaded
- `✅ SMTP connection verified successfully` - Connection works
- `❌ SMTP connection verification failed` - Connection issues
- `📧 MOCK EMAIL SENT (Fallback)` - Using fallback mode

If you see mock emails being sent, check:
1. Environment variables are set correctly
2. Gmail App Password is valid
3. 2FA is enabled on Gmail account
4. Network connectivity from Render.com to Gmail
