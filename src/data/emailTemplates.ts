// Email template data for the Email Templates Gallery page
// Each template contains inline-styled HTML ready for backend use

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'authentication' | 'orders' | 'consultations' | 'account';
  description: string;
  subject: string;
  html: string;
}

const HEADER = `
<div style="background: linear-gradient(135deg, #246BFD 0%, #1B4DBC 100%); padding: 32px 24px; text-align: center;">
  <img src="https://fyndrx.com/assets/logo-white.png" alt="FyndRX" style="height: 40px; margin-bottom: 8px;" />
  <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0;">Your Trusted Healthcare Partner</p>
</div>`;

const FOOTER = `
<div style="background: #F8FAFC; padding: 32px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
  <table role="presentation" style="margin: 0 auto 20px; border: 0; cellpadding: 0; cellspacing: 0;">
    <tr>
      <td style="padding: 0 6px;">
        <a href="https://www.facebook.com/fyndrx" style="display:inline-block;width:36px;height:36px;background:#246BFD;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/24/ffffff/facebook-new.png" alt="Facebook" style="width:18px;height:18px;vertical-align:middle;border:0;" />
        </a>
      </td>
      <td style="padding: 0 6px;">
        <a href="https://twitter.com/fyndrx" style="display:inline-block;width:36px;height:36px;background:#1E293B;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/24/ffffff/twitterx--v1.png" alt="X" style="width:18px;height:18px;vertical-align:middle;border:0;" />
        </a>
      </td>
      <td style="padding: 0 6px;">
        <a href="https://instagram.com/fyndrx_" style="display:inline-block;width:36px;height:36px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png" alt="Instagram" style="width:18px;height:18px;vertical-align:middle;border:0;" />
        </a>
      </td>
      <td style="padding: 0 6px;">
        <a href="https://www.youtube.com/@fyndrx_" style="display:inline-block;width:36px;height:36px;background:#FF0000;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/24/ffffff/youtube-play.png" alt="YouTube" style="width:18px;height:18px;vertical-align:middle;border:0;" />
        </a>
      </td>
      <td style="padding: 0 6px;">
        <a href="https://www.tiktok.com/@fyndrx_" style="display:inline-block;width:36px;height:36px;background:#010101;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/24/ffffff/tiktok--v1.png" alt="TikTok" style="width:18px;height:18px;vertical-align:middle;border:0;" />
        </a>
      </td>
      <td style="padding: 0 6px;">
        <a href="https://www.linkedin.com/company/fyndrx" style="display:inline-block;width:36px;height:36px;background:#0A66C2;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/24/ffffff/linkedin.png" alt="LinkedIn" style="width:18px;height:18px;vertical-align:middle;border:0;" />
        </a>
      </td>
    </tr>
  </table>
  <p style="color: #94A3B8; font-size: 12px; margin: 0 0 8px;">Mayflower Building, Community 10, Tema, Greater Accra</p>
  <p style="color: #94A3B8; font-size: 12px; margin: 0 0 16px;">
    <a href="mailto:support@fyndrx.com" style="color: #246BFD; text-decoration: none;">support@fyndrx.com</a> &bull; +233 53 051 0839
  </p>
  <p style="color: #CBD5E1; font-size: 11px; margin: 0;">
    &copy; ${new Date().getFullYear()} FyndRX. All rights reserved. &bull;
    <a href="https://fyndrx.com/privacy" style="color: #94A3B8; text-decoration: none;">Privacy</a> &bull;
    <a href="https://fyndrx.com/terms" style="color: #94A3B8; text-decoration: none;">Terms</a> &bull;
    <a href="#" style="color: #94A3B8; text-decoration: none;">Unsubscribe</a>
  </p>
</div>`;

function wrap(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">${HEADER}${body}${FOOTER}</div></body></html>`;
}

function btn(text: string, href = '#'): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#246BFD,#1B4DBC);color:#ffffff;font-weight:600;font-size:15px;padding:14px 36px;border-radius:50px;text-decoration:none;margin:8px 0;box-shadow:0 4px 14px rgba(36,107,253,0.3);">${text}</a>`;
}

function btnOrange(text: string, href = '#'): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#FE9615,#E07D00);color:#ffffff;font-weight:600;font-size:15px;padding:14px 36px;border-radius:50px;text-decoration:none;margin:8px 0;box-shadow:0 4px 14px rgba(254,150,21,0.3);">${text}</a>`;
}

function infoRow(label: string, value: string): string {
  return `<tr><td style="padding:10px 16px;color:#64748B;font-size:14px;border-bottom:1px solid #F1F5F9;">${label}</td><td style="padding:10px 16px;color:#1E293B;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #F1F5F9;">${value}</td></tr>`;
}

export const emailTemplates: EmailTemplate[] = [
  // ─── AUTHENTICATION ───
  {
    id: 'welcome',
    name: 'Welcome Email',
    category: 'authentication',
    description: 'Sent immediately after a new user registers',
    subject: 'Welcome to FyndRX! 🎉',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#246BFD20,#246BFD10);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">👋</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 12px;">Welcome to FyndRX!</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;max-width:440px;margin-left:auto;margin-right:auto;">
          Hi <strong>{{name}}</strong>, we're thrilled to have you join our healthcare community. Find pharmacies, compare medication prices, and book consultations — all in one place.
        </p>
        <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin:0 0 28px;text-align:left;">
          <p style="color:#1E293B;font-weight:600;font-size:15px;margin:0 0 16px;">🚀 Get started in 3 steps:</p>
          <p style="color:#64748B;font-size:14px;margin:0 0 10px;">1️⃣ &nbsp;Complete your profile</p>
          <p style="color:#64748B;font-size:14px;margin:0 0 10px;">2️⃣ &nbsp;Search for medications or pharmacies</p>
          <p style="color:#64748B;font-size:14px;margin:0;">3️⃣ &nbsp;Book your first consultation</p>
        </div>
        ${btn('Explore FyndRX', 'https://fyndrx.com/dashboard')}
      </div>`)
  },
  {
    id: 'email-verification',
    name: 'Email Verification',
    category: 'authentication',
    description: 'OTP code sent for email address verification',
    subject: 'Verify Your Email Address',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#246BFD20,#246BFD10);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">✉️</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 12px;">Verify Your Email</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Use the code below to verify your email address. This code expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:12px;padding:24px;margin:0 auto 28px;max-width:280px;">
          <p style="font-size:36px;font-weight:800;letter-spacing:12px;color:#246BFD;margin:0;font-family:monospace;">{{otp}}</p>
        </div>
        <p style="color:#94A3B8;font-size:13px;margin:0;">If you didn't create an account, you can safely ignore this email.</p>
      </div>`)
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    category: 'authentication',
    description: 'Sent when a user requests a password reset',
    subject: 'Reset Your Password',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#FE961520,#FE961510);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">🔐</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 12px;">Reset Your Password</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 8px;">
          We received a request to reset your password. Use the code below or click the button.
        </p>
        <p style="color:#94A3B8;font-size:13px;margin:0 0 28px;">This link expires in <strong>30 minutes</strong>.</p>
        <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:12px;padding:24px;margin:0 auto 24px;max-width:280px;">
          <p style="font-size:36px;font-weight:800;letter-spacing:12px;color:#FE9615;margin:0;font-family:monospace;">{{otp}}</p>
        </div>
        ${btnOrange('Reset Password', 'https://fyndrx.com/reset-password?token={{token}}')}
        <p style="color:#94A3B8;font-size:13px;margin:20px 0 0;">If you didn't request this, please ignore this email or contact support.</p>
      </div>`)
  },

  // ─── ORDERS ───
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    category: 'orders',
    description: 'Sent when an order is successfully placed',
    subject: 'Order Confirmed! #{{orderNumber}}',
    html: wrap(`
      <div style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="width:72px;height:72px;background:#ECFDF5;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:36px;">✅</span>
          </div>
          <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Order Confirmed!</h1>
          <p style="color:#64748B;font-size:15px;margin:0;">Your order <strong style="color:#246BFD;">#{{orderNumber}}</strong> has been placed successfully.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#F8FAFC;border-radius:12px;overflow:hidden;margin-bottom:24px;">
          ${infoRow('Pharmacy', '{{pharmacyName}}')}
          ${infoRow('Items', '{{itemCount}} item(s)')}
          ${infoRow('Payment', '{{paymentMethod}}')}
          ${infoRow('Total', 'GHS {{total}}')}
        </table>
        <div style="text-align:center;">
          ${btn('View Order Details', 'https://fyndrx.com/orders/{{orderId}}')}
        </div>
      </div>`)
  },
  {
    id: 'order-shipped',
    name: 'Order Shipped',
    category: 'orders',
    description: 'Sent when an order is dispatched for delivery',
    subject: 'Your Order is On Its Way! 🚚',
    html: wrap(`
      <div style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="width:72px;height:72px;background:#EFF6FF;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:36px;">🚚</span>
          </div>
          <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Your Order is On Its Way!</h1>
          <p style="color:#64748B;font-size:15px;margin:0;">Order <strong style="color:#246BFD;">#{{orderNumber}}</strong> has been dispatched.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#F8FAFC;border-radius:12px;overflow:hidden;margin-bottom:24px;">
          ${infoRow('Tracking ID', '{{trackingId}}')}
          ${infoRow('Estimated Delivery', '{{estimatedDate}}')}
          ${infoRow('Delivery Address', '{{deliveryAddress}}')}
        </table>
        <div style="text-align:center;">
          ${btn('Track Order', 'https://fyndrx.com/orders/{{orderId}}')}
        </div>
      </div>`)
  },
  {
    id: 'order-delivered',
    name: 'Order Delivered',
    category: 'orders',
    description: 'Sent when delivery is confirmed',
    subject: 'Order Delivered Successfully! 📦',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:#ECFDF5;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">📦</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Order Delivered!</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Your order <strong style="color:#246BFD;">#{{orderNumber}}</strong> has been delivered. We hope everything is perfect!
        </p>
        <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin:0 0 28px;">
          <p style="color:#1E293B;font-weight:600;font-size:15px;margin:0 0 8px;">How was your experience?</p>
          <p style="color:#64748B;font-size:14px;margin:0;">Your feedback helps us serve you better.</p>
        </div>
        ${btnOrange('Leave a Review', 'https://fyndrx.com/orders/{{orderId}}')}
      </div>`)
  },
  {
    id: 'order-cancelled',
    name: 'Order Cancelled',
    category: 'orders',
    description: 'Sent when an order is cancelled',
    subject: 'Order #{{orderNumber}} Cancelled',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:#FEF2F2;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">❌</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Order Cancelled</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Your order <strong>#{{orderNumber}}</strong> has been cancelled. If you paid online, a refund will be processed within 3-5 business days.
        </p>
        <table style="width:100%;border-collapse:collapse;background:#F8FAFC;border-radius:12px;overflow:hidden;margin-bottom:28px;">
          ${infoRow('Order', '#{{orderNumber}}')}
          ${infoRow('Reason', '{{cancellationReason}}')}
          ${infoRow('Refund Status', '{{refundStatus}}')}
        </table>
        ${btn('Browse Medications', 'https://fyndrx.com/medications')}
        <p style="color:#94A3B8;font-size:13px;margin:20px 0 0;">Need help? <a href="mailto:support@fyndrx.com" style="color:#246BFD;">Contact Support</a></p>
      </div>`)
  },

  // ─── CONSULTATIONS ───
  {
    id: 'consultation-booked',
    name: 'Consultation Booked',
    category: 'consultations',
    description: 'Confirmation when a telehealth appointment is booked',
    subject: 'Consultation Booked Successfully! 🩺',
    html: wrap(`
      <div style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#246BFD20,#246BFD10);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:36px;">🩺</span>
          </div>
          <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Consultation Booked!</h1>
          <p style="color:#64748B;font-size:15px;margin:0;">Your telehealth consultation has been confirmed.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#F8FAFC;border-radius:12px;overflow:hidden;margin-bottom:24px;">
          ${infoRow('Reference', '{{consultationRef}}')}
          ${infoRow('Doctor', 'Dr. {{doctorName}}')}
          ${infoRow('Date & Time', '{{dateTime}}')}
          ${infoRow('Type', '{{consultationType}}')}
        </table>
        <div style="background:#FFF7ED;border-left:4px solid #FE9615;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
          <p style="color:#92400E;font-size:14px;margin:0;"><strong>Reminder:</strong> Please be available 5 minutes before your scheduled time. Have your medical history and current medications ready.</p>
        </div>
        <div style="text-align:center;">
          ${btn('View Consultation', 'https://fyndrx.com/consultations/{{consultationId}}')}
        </div>
      </div>`)
  },
  {
    id: 'consultation-reminder',
    name: 'Consultation Reminder',
    category: 'consultations',
    description: 'Reminder sent before an upcoming consultation',
    subject: 'Reminder: Your Consultation is Tomorrow 📅',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:#FFF7ED;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">📅</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Upcoming Consultation</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;">
          This is a friendly reminder that your consultation with <strong>Dr. {{doctorName}}</strong> is scheduled for:
        </p>
        <div style="background:linear-gradient(135deg,#246BFD,#1B4DBC);border-radius:12px;padding:28px;margin:0 0 28px;">
          <p style="color:rgba(255,255,255,0.8);font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Scheduled For</p>
          <p style="color:#FFFFFF;font-size:22px;font-weight:700;margin:0;">{{dateTime}}</p>
        </div>
        ${btnOrange('Join Consultation', 'https://fyndrx.com/consultations/{{consultationId}}')}
      </div>`)
  },
  {
    id: 'prescription-ready',
    name: 'Prescription Ready',
    category: 'consultations',
    description: 'Notification when a new prescription is available',
    subject: 'Your Prescription is Ready! 💊',
    html: wrap(`
      <div style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="width:72px;height:72px;background:#ECFDF5;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:36px;">💊</span>
          </div>
          <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Prescription Ready</h1>
          <p style="color:#64748B;font-size:15px;margin:0;">Dr. {{doctorName}} has issued a new prescription for you.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#F8FAFC;border-radius:12px;overflow:hidden;margin-bottom:24px;">
          ${infoRow('Prescribed By', 'Dr. {{doctorName}}')}
          ${infoRow('Medications', '{{medicationCount}} item(s)')}
          ${infoRow('Valid Until', '{{validUntil}}')}
        </table>
        <div style="text-align:center;">
          ${btn('View Prescription', 'https://fyndrx.com/prescriptions')}
          <p style="color:#64748B;font-size:14px;margin:16px 0 0;">You can also order these medications through FyndRX.</p>
        </div>
      </div>`)
  },

  // ─── ACCOUNT ───
  {
    id: 'account-verified',
    name: 'Account Verified',
    category: 'account',
    description: 'Sent when identity verification is approved',
    subject: 'Your Account Has Been Verified! ✅',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:#ECFDF5;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">🎉</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 12px;">Account Verified!</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;max-width:440px;margin-left:auto;margin-right:auto;">
          Great news, <strong>{{name}}</strong>! Your identity has been verified successfully. You now have full access to all FyndRX features.
        </p>
        <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin:0 0 28px;text-align:left;">
          <p style="color:#1E293B;font-weight:600;font-size:15px;margin:0 0 16px;">🔓 Unlocked Features:</p>
          <p style="color:#64748B;font-size:14px;margin:0 0 10px;">✓ &nbsp;Order prescription medications</p>
          <p style="color:#64748B;font-size:14px;margin:0 0 10px;">✓ &nbsp;Book telehealth consultations</p>
          <p style="color:#64748B;font-size:14px;margin:0;">✓ &nbsp;Access your full medical history</p>
        </div>
        ${btn('Go to Dashboard', 'https://fyndrx.com/dashboard')}
      </div>`)
  },
  {
    id: 'account-suspended',
    name: 'Account Suspended',
    category: 'account',
    description: 'Notification when an account is suspended',
    subject: 'Important: Account Suspended',
    html: wrap(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:72px;height:72px;background:#FEF2F2;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;">⚠️</span>
        </div>
        <h1 style="color:#1E293B;font-size:26px;margin:0 0 12px;">Account Suspended</h1>
        <p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;max-width:440px;margin-left:auto;margin-right:auto;">
          Your FyndRX account has been temporarily suspended due to a policy violation. Please review our terms of service or contact support for more information.
        </p>
        <div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;text-align:left;">
          <p style="color:#991B1B;font-size:14px;margin:0;"><strong>Reason:</strong> {{suspensionReason}}</p>
        </div>
        ${btn('Contact Support', 'mailto:support@fyndrx.com')}
      </div>`)
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'account',
    description: 'Periodic newsletter with health tips and updates',
    subject: 'FyndRX Health Digest — {{month}} Edition 📬',
    html: wrap(`
      <div style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#1E293B;font-size:26px;margin:0 0 8px;">Health Digest</h1>
          <p style="color:#FE9615;font-size:14px;font-weight:600;margin:0;">{{month}} Edition</p>
        </div>
        <div style="background:linear-gradient(135deg,#246BFD08,#FE961508);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="color:#1E293B;font-size:18px;margin:0 0 12px;">🏥 Featured Article</h2>
          <p style="color:#64748B;font-size:14px;line-height:1.7;margin:0 0 16px;">{{featuredArticleSummary}}</p>
          <a href="{{featuredArticleUrl}}" style="color:#246BFD;font-weight:600;font-size:14px;text-decoration:none;">Read More →</a>
        </div>
        <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="color:#1E293B;font-size:18px;margin:0 0 12px;">💊 Health Tip of the Month</h2>
          <p style="color:#64748B;font-size:14px;line-height:1.7;margin:0;">{{healthTip}}</p>
        </div>
        <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin-bottom:28px;">
          <h2 style="color:#1E293B;font-size:18px;margin:0 0 12px;">🆕 What's New on FyndRX</h2>
          <p style="color:#64748B;font-size:14px;line-height:1.7;margin:0;">{{whatsNew}}</p>
        </div>
        <div style="text-align:center;">
          ${btn('Visit FyndRX', 'https://fyndrx.com')}
        </div>
      </div>`)
  }
];

export const categories = [
  { id: 'all', label: 'All Templates', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>` },
  { id: 'authentication', label: 'Authentication', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>` },
  { id: 'orders', label: 'Orders', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>` },
  { id: 'consultations', label: 'Consultations', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M9 14l2 2 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>` },
  { id: 'account', label: 'Account & Notifications', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>` }
];
