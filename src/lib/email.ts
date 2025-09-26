/**
 * Email utilities using React Email
 * Transactional email templates for SaaS features
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface WelcomeEmailData {
  to: string;
  name: string;
  loginUrl?: string;
}

export interface CreditAlertEmailData {
  to: string;
  name: string;
  remainingCredits: number;
  planName: string;
}

export interface SubscriptionUpdateEmailData {
  to: string;
  name: string;
  planName: string;
  status: 'activated' | 'cancelled' | 'updated';
  nextBillingDate?: string;
}

// Generic email sender
export async function sendEmail(data: EmailData) {
  try {
    const result = await resend.emails.send({
      from: 'VibeCoding <noreply@vibesdk.com>',
      to: [data.to],
      subject: data.subject,
      html: data.html,
      text: data.text ?? '', // Ensure text is always a string
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Welcome email template
export async function sendWelcomeEmail({ to, name, loginUrl }: WelcomeEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to VibeCoding</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Welcome to VibeCoding, ${name}! 🚀</h1>
          
          <p>Thank you for joining VibeCoding! We're excited to help you build amazing applications with our AI-powered development platform.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">What's next?</h2>
            <ul>
              <li>🎯 Start your first AI chat session</li>
              <li>📱 Build your first app with VibeSDK</li>
              <li>💡 Explore our template library</li>
              <li>🔧 Customize your development environment</li>
            </ul>
          </div>
          
          ${loginUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started Now</a>
            </div>
          ` : ''}
          
          <p>If you have any questions, our support team is here to help!</p>
          
          <p>Happy coding!<br>
          The VibeCoding Team</p>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    Welcome to VibeCoding, ${name}!
    
    Thank you for joining VibeCoding! We're excited to help you build amazing applications with our AI-powered development platform.
    
    What's next?
    - Start your first AI chat session
    - Build your first app with VibeSDK
    - Explore our template library
    - Customize your development environment
    
    ${loginUrl ? `Get started: ${loginUrl}` : ''}
    
    If you have any questions, our support team is here to help!
    
    Happy coding!
    The VibeCoding Team
  `;
  
  return sendEmail({
    to,
    subject: 'Welcome to VibeCoding - Let\'s start building! 🚀',
    html,
    text,
  });
}

// Credit alert email
export async function sendCreditAlertEmail({ to, name, remainingCredits, planName }: CreditAlertEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Credit Alert - VibeCoding</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b;">Credit Alert ⚠️</h1>
          
          <p>Hi ${name},</p>
          
          <p>You have <strong>${remainingCredits} credits</strong> remaining in your ${planName} plan.</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Don't let your creativity stop!</strong></p>
            <p style="margin: 5px 0 0 0;">Consider upgrading your plan to continue building without interruption.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.VITE_SITE_URL}/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Manage Credits</a>
          </div>
          
          <p>Thanks for using VibeCoding!</p>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    Credit Alert - VibeCoding
    
    Hi ${name},
    
    You have ${remainingCredits} credits remaining in your ${planName} plan.
    
    Don't let your creativity stop! Consider upgrading your plan to continue building without interruption.
    
    Manage your credits: ${process.env.VITE_SITE_URL}/dashboard
    
    Thanks for using VibeCoding!
  `;
  
  return sendEmail({
    to,
    subject: `Credit Alert: ${remainingCredits} credits remaining`,
    html,
    text,
  });
}

// Subscription update email
export async function sendSubscriptionUpdateEmail({ to, name, planName, status, nextBillingDate }: SubscriptionUpdateEmailData) {
  const statusMessages = {
    activated: { title: 'Subscription Activated! 🎉', color: '#10b981' },
    cancelled: { title: 'Subscription Cancelled', color: '#ef4444' },
    updated: { title: 'Subscription Updated', color: '#2563eb' },
  };
  
  const { title, color } = statusMessages[status];
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - VibeCoding</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${color};">${title}</h1>
          
          <p>Hi ${name},</p>
          
          <p>Your subscription to the <strong>${planName}</strong> plan has been ${status}.</p>
          
          ${nextBillingDate ? `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Next billing date:</strong> ${nextBillingDate}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.VITE_SITE_URL}/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
          </div>
          
          <p>Thanks for using VibeCoding!</p>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    ${title} - VibeCoding
    
    Hi ${name},
    
    Your subscription to the ${planName} plan has been ${status}.
    
    ${nextBillingDate ? `Next billing date: ${nextBillingDate}` : ''}
    
    View your dashboard: ${process.env.VITE_SITE_URL}/dashboard
    
    Thanks for using VibeCoding!
  `;
  
  return sendEmail({
    to,
    subject: title,
    html,
    text,
  });
}