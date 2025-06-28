import nodemailer from 'nodemailer';
import { logger } from './logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('Email service not configured - missing SMTP credentials');
        return;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.isConfigured = true;
      logger.info('Email service initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail({ to, subject, html, text, template, data }) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      let emailContent = { html, text };

      // If template is specified, generate content from template
      if (template && data) {
        emailContent = this.generateFromTemplate(template, data);
      }

      const mailOptions = {
        from: `${process.env.FROM_NAME || 'MyScheme'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        ...emailContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId
      });

      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      logger.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  generateFromTemplate(template, data) {
    const templates = {
      welcome: {
        subject: 'Welcome to MyScheme!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Welcome to MyScheme!</h1>
            <p>Hello ${data.name},</p>
            <p>Thank you for joining MyScheme - your gateway to government schemes and benefits.</p>
            <p>You can now:</p>
            <ul>
              <li>Search and discover relevant government schemes</li>
              <li>Check your eligibility for various benefits</li>
              <li>Get step-by-step application guidance</li>
              <li>Track your applications</li>
            </ul>
            <p>
              <a href="${data.loginUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Get Started
              </a>
            </p>
            <p>Best regards,<br>The MyScheme Team</p>
          </div>
        `,
        text: `Welcome to MyScheme!\n\nHello ${data.name},\n\nThank you for joining MyScheme. You can now access government schemes and benefits at ${data.loginUrl}\n\nBest regards,\nThe MyScheme Team`
      },
      
      'password-reset': {
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Password Reset Request</h1>
            <p>Hello ${data.name},</p>
            <p>We received a request to reset your password for your MyScheme account.</p>
            <p>Click the button below to reset your password:</p>
            <p>
              <a href="${data.resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Reset Password
              </a>
            </p>
            <p>This link will expire in ${data.expiresIn}.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The MyScheme Team</p>
          </div>
        `,
        text: `Password Reset Request\n\nHello ${data.name},\n\nWe received a request to reset your password. Click this link to reset it: ${data.resetUrl}\n\nThis link expires in ${data.expiresIn}.\n\nBest regards,\nThe MyScheme Team`
      },

      'email-verification': {
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Verify Your Email Address</h1>
            <p>Hello ${data.name},</p>
            <p>Please verify your email address to complete your MyScheme account setup.</p>
            <p>
              <a href="${data.verificationUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Verify Email
              </a>
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>The MyScheme Team</p>
          </div>
        `,
        text: `Verify Your Email Address\n\nHello ${data.name},\n\nPlease verify your email address: ${data.verificationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nThe MyScheme Team`
      },

      notification: {
        subject: data.subject || 'MyScheme Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">${data.title}</h1>
            <p>Hello ${data.name},</p>
            <p>${data.message}</p>
            ${data.actionUrl ? `
              <p>
                <a href="${data.actionUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  ${data.actionText || 'View Details'}
                </a>
              </p>
            ` : ''}
            <p>Best regards,<br>The MyScheme Team</p>
          </div>
        `,
        text: `${data.title}\n\nHello ${data.name},\n\n${data.message}\n\n${data.actionUrl ? `View details: ${data.actionUrl}\n\n` : ''}Best regards,\nThe MyScheme Team`
      }
    };

    const template_data = templates[template];
    if (!template_data) {
      throw new Error(`Template '${template}' not found`);
    }

    return {
      html: template_data.html,
      text: template_data.text
    };
  }

  async verifyConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection verified' };
    } catch (error) {
      logger.error('Email service verification failed:', error);
      return { success: false, error: error.message };
    }
  }
}

const emailService = new EmailService();

export const sendEmail = (options) => emailService.sendEmail(options);
export const verifyEmailConnection = () => emailService.verifyConnection();
export default emailService;