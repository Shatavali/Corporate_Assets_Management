const nodemailer = require('nodemailer');

// Environment variables with defaults
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_MAIL = process.env.SMTP_MAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Helper to create transporter with comprehensive error handling
const getTransporter = () => {
  // If we have complete SMTP config, use it
  if (SMTP_HOST && SMTP_MAIL && SMTP_PASSWORD) {
    console.log('📧 Using SMTP configuration:', SMTP_HOST);
    
    // Check if using Gmail
    const isGmail = SMTP_HOST.includes('gmail.com');
    
    const transporterConfig = {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD,
      },
      // Force IPv4 to avoid connection issues
      family: 4,
      // Connection timeouts
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      // TLS configuration
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
      },
    };

    // Gmail-specific configuration
    if (isGmail) {
      return nodemailer.createTransport({
        ...transporterConfig,
        // Gmail often works better with these settings
        requireTLS: true,
        pool: true,
        maxConnections: 1,
        maxMessages: 10,
        // Don't use secure for Gmail on port 587
        secure: false,
      });
    }

    return nodemailer.createTransport(transporterConfig);
  }
  
  // In production, missing SMTP config is an error
  if (NODE_ENV === 'production') {
    console.error('❌ SMTP configuration is required in production. Set SMTP_HOST, SMTP_MAIL, SMTP_PASSWORD.');
    throw new Error('SMTP configuration is required in production');
  }
  
  // Development fallback: create ethereal test account
  console.log('⚠️ No SMTP config found. Using ethereal email test account...');
  
  // For development, we'll use a simpler approach
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'your-ethereal-email@ethereal.email', // You need to create one
      pass: 'your-ethereal-password',
    },
  });
};

// Create transporter lazily
let transporter = null;

const getTransporterInstance = async () => {
  if (!transporter) {
    try {
      transporter = await getTransporter();
      
      // Verify the connection
      if (transporter) {
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
      }
    } catch (error) {
      console.error('❌ Failed to create transporter:', error.message);
      
      // In development, use a mock transporter
      if (NODE_ENV !== 'production') {
        console.log('📧 Using mock email transporter for development');
        transporter = {
          sendMail: async (mailOptions) => {
            console.log('📧 [MOCK] Email would be sent:');
            console.log(`To: ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Body preview: ${mailOptions.html?.substring(0, 200)}...`);
            return { messageId: 'mock-' + Date.now() };
          },
          verify: async () => true,
        };
      } else {
        throw error;
      }
    }
  }
  return transporter;
};

// Send email with retry logic
const sendEmail = async (mailOptions, retries = 3) => {
  try {
    const transport = await getTransporterInstance();
    
    if (!transport) {
      console.log('📧 [FALLBACK] No email transporter. Logging email content:');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body preview: ${mailOptions.html?.substring(0, 300)}...`);
      return { messageId: 'fallback-no-email-sent' };
    }

    // Send with retry logic
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const info = await transport.sendMail(mailOptions);
        console.log(`✅ Email sent to ${mailOptions.to}: ${info.messageId}`);
        
        // Log preview URL for ethereal
        if (info.messageId && info.messageId.includes('ethereal')) {
          console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return info;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Email send attempt ${attempt}/${retries} failed:`, error.message);
        
        // If it's a connection issue, wait before retrying
        if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT' || 
            error.code === 'ENETUNREACH' || error.code === 'ECONNREFUSED') {
          if (attempt < retries) {
            const waitTime = attempt * 2000; // Progressive backoff
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        // If it's an auth error, don't retry
        if (error.code === 'EAUTH' || error.code === 'EENVELOPE') {
          break;
        }
      }
    }
    
    // If we get here, all retries failed
    console.error('❌ Email send failed after all retries:', lastError?.message);
    
    // In development, log the email that would have been sent
    if (NODE_ENV !== 'production') {
      console.log('📧 [DEV] Email would have been sent to:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body preview:', mailOptions.html?.substring(0, 300));
      return { messageId: 'dev-fallback-' + Date.now() };
    }
    
    throw lastError || new Error('Email send failed after retries');
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    throw error;
  }
};

// ========== Email Templates ==========

// Send OTP Email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: email,
    subject: '🔐 Email Verification OTP - Asset Management System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Asset Management System</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Hello ${name || 'User'}!</h3>
            <p>Thank you for registering. Please verify your email address using the OTP below:</p>
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: email,
    subject: '🎉 Welcome to Asset Management System!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .feature { padding: 10px; margin: 10px 0; background: #f8f9fa; border-radius: 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to Asset Management System!</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Hello ${name || 'User'}!</h3>
            <p>Your email has been successfully verified. You can now access the system with these features:</p>
            <div class="feature">✅ Track and manage company assets</div>
            <div class="feature">✅ Request maintenance for assets</div>
            <div class="feature">✅ View your allocated assets</div>
            <div class="feature">✅ Generate reports and analytics</div>
            <p>Get started by logging into your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, otp, name) => {
  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: email,
    subject: '🔑 Password Reset OTP - Asset Management System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Password Reset Request</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Hello ${name || 'User'}!</h3>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <div class="warning">
              ⚠️ If you didn't request this, please ignore this email and ensure your account is secure.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Asset Assignment Notification
const sendAssetAssignmentEmail = async (email, name, assetName, assetTag, expectedReturnDate, purpose) => {
  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: email,
    subject: '📦 Asset Assigned to You - Asset Management System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .asset-details { background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Asset Assignment Confirmation</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Hello ${name || 'User'}!</h3>
            <p>The following asset has been assigned to you:</p>
            <div class="asset-details">
              <p><strong>Asset Name:</strong> ${assetName}</p>
              <p><strong>Asset Tag:</strong> ${assetTag}</p>
              <p><strong>Purpose:</strong> ${purpose || 'Work related'}</p>
              <p><strong>Expected Return Date:</strong> ${new Date(expectedReturnDate).toLocaleDateString()}</p>
            </div>
            <p>Please take care of the asset and return it on or before the expected date.</p>
            <p>If you have any issues, please contact your manager immediately.</p>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Maintenance Request Approval Notification (for Manager)
const sendMaintenanceApprovalRequestEmail = async (managerEmail, managerName, requestDetails) => {
  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: managerEmail,
    subject: '🔧 Maintenance Request Pending Approval',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .request-details { background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Maintenance Request Approval Required</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Dear ${managerName || 'Manager'},</h3>
            <p>A maintenance request requires your approval:</p>
            <div class="request-details">
              <p><strong>Asset:</strong> ${requestDetails.assetName}</p>
              <p><strong>Asset Tag:</strong> ${requestDetails.assetTag}</p>
              <p><strong>Issue:</strong> ${requestDetails.issue}</p>
              <p><strong>Issue Type:</strong> ${requestDetails.issueType}</p>
              <p><strong>Severity:</strong> ${requestDetails.severity}</p>
              <p><strong>Reported By:</strong> ${requestDetails.reportedByName}</p>
              <p><strong>Reported Date:</strong> ${new Date(requestDetails.maintenanceDate).toLocaleString()}</p>
            </div>
            <p>Please login to the system to approve or reject this request.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/maintenance/${requestDetails.id}" class="button">View Request</a>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Maintenance Approved/Completed Notification (for Employee)
const sendMaintenanceStatusUpdateEmail = async (userEmail, userName, requestDetails, status) => {
  const statusMessage = status === 'Approved' 
    ? 'Your maintenance request has been approved! A technician will be assigned shortly.'
    : 'Your maintenance request has been completed.';

  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: userEmail,
    subject: `🔧 Maintenance Request ${status} - Asset Management System`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Maintenance Request ${status}</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Hello ${userName || 'User'},</h3>
            <p>${statusMessage}</p>
            <p><strong>Asset:</strong> ${requestDetails.assetName}</p>
            <p><strong>Issue:</strong> ${requestDetails.issue}</p>
            ${requestDetails.resolution ? `<p><strong>Resolution:</strong> ${requestDetails.resolution}</p>` : ''}
            <p>You can track the status in your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Overdue Asset Return Reminder
const sendOverdueReminderEmail = async (userEmail, userName, assetName, assetTag, daysOverdue) => {
  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: userEmail,
    subject: '⚠️ Overdue Asset Return Notice - Asset Management System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Overdue Asset Return Notice</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Hello ${userName || 'User'},</h3>
            <div class="warning">
              <p><strong>The following asset is ${daysOverdue} days overdue:</strong></p>
              <p><strong>Asset:</strong> ${assetName}</p>
              <p><strong>Asset Tag:</strong> ${assetTag}</p>
            </div>
            <p>Please return this asset immediately to avoid further escalation.</p>
            <p>If you still need this asset, please request an extension from your manager.</p>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Asset Return Confirmation
const sendAssetReturnConfirmationEmail = async (userEmail, userName, assetName, assetTag, returnDate, condition) => {
  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: userEmail,
    subject: '✅ Asset Return Confirmation - Asset Management System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Asset Return Confirmed</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Hello ${userName || 'User'},</h3>
            <p>The following asset has been successfully returned:</p>
            <p><strong>Asset:</strong> ${assetName}</p>
            <p><strong>Asset Tag:</strong> ${assetTag}</p>
            <p><strong>Return Date:</strong> ${new Date(returnDate).toLocaleDateString()}</p>
            <p><strong>Return Condition:</strong> ${condition}</p>
            <p>Thank you for returning the asset on time.</p>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

// Admin Alert Email
const sendAdminAlertEmail = async (adminEmail, adminName, alertType, details) => {
  const alertColors = {
    warranty: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    maintenance: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    stock: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  };

  const mailOptions = {
    from: SMTP_MAIL || 'noreply@assethub.com',
    to: adminEmail,
    subject: `📊 ${alertType.toUpperCase()} Alert - Asset Management System`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
          .header { background: ${alertColors[alertType] || '#667eea'}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${alertType.toUpperCase()} Alert</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Dear ${adminName || 'Admin'},</h3>
            <p>The following requires your attention:</p>
            ${details}
            <p>Please login to take necessary action.</p>
          </div>
          <div class="footer">
            <p>© 2025 Asset Management System. All rights reserved.</p>
          </div>
        </div>
      </html>
    `,
  };
  return sendEmail(mailOptions);
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAssetAssignmentEmail,
  sendMaintenanceApprovalRequestEmail,
  sendMaintenanceStatusUpdateEmail,
  sendOverdueReminderEmail,
  sendAssetReturnConfirmationEmail,
  sendAdminAlertEmail,
};