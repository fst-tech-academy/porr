const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_KEY);

// System configuration
const SYSTEM_CONFIG = {
  email: process.env.SENDGRID_EMAIL_FROM || 'info@luulsolutions.com',
  phoneNumber: '+447838079175',
  companyName: 'Luul Solutions',
  website: 'https://luulsolutions.com',
};

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to NPST Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to NPST Platform!</h2>
        <p>Hello {{name}},</p>
        <p>Welcome to the New Project Starter Template platform. Your account has been successfully created.</p>
        <p>You can now access your dashboard and start using our services.</p>
        <p>Best regards,<br>The NPST Team</p>
      </div>
    `,
  },
  passwordReset: {
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello {{name}},</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <p><a href="{{resetLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The NPST Team</p>
      </div>
    `,
  },
  emailVerification: {
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Hello {{name}},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="{{verificationLink}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The NPST Team</p>
      </div>
    `,
  },
};

// Utility functions
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Email sending functions
const sendWelcomeEmail = async (to, name) => {
  try {
    const msg = {
      to,
      from: SYSTEM_CONFIG.email,
      subject: EMAIL_TEMPLATES.welcome.subject,
      html: EMAIL_TEMPLATES.welcome.html.replace(/\{\{name\}\}/g, name),
    };

    await sgMail.send(msg);
    console.log('Welcome email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (to, name, resetLink) => {
  try {
    const msg = {
      to,
      from: SYSTEM_CONFIG.email,
      subject: EMAIL_TEMPLATES.passwordReset.subject,
      html: EMAIL_TEMPLATES.passwordReset.html
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{resetLink\}\}/g, resetLink),
    };

    await sgMail.send(msg);
    console.log('Password reset email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

const sendEmailVerificationEmail = async (to, name, verificationLink) => {
  try {
    const msg = {
      to,
      from: SYSTEM_CONFIG.email,
      subject: EMAIL_TEMPLATES.emailVerification.subject,
      html: EMAIL_TEMPLATES.emailVerification.html
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{verificationLink\}\}/g, verificationLink),
    };

    await sgMail.send(msg);
    console.log('Email verification sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending email verification:', error);
    return { success: false, error: error.message };
  }
};

const sendCustomEmail = async (to, subject, html, from = SYSTEM_CONFIG.email) => {
  try {
    const msg = {
      to,
      from,
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log('Custom email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending custom email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    if (!process.env.SENDGRID_KEY) {
      throw new Error('SENDGRID_KEY environment variable is not set');
    }

    const msg = {
      to: SYSTEM_CONFIG.email,
      from: SYSTEM_CONFIG.email,
      subject: 'Email Configuration Test',
      html: '<p>This is a test email to verify email configuration.</p>',
    };

    await sgMail.send(msg);
    console.log('Email configuration test successful');
    return { success: true };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendCustomEmail,
  testEmailConfiguration,
  generateVerificationToken,
  generateResetToken,
  SYSTEM_CONFIG,
  EMAIL_TEMPLATES,
};
