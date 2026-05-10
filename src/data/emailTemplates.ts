export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
}

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    width: 100% !important;
    height: 100% !important;
    background-color: #F8FAFC;
    font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1E293B;
  }
  
  table {
    border-spacing: 0;
    border-collapse: collapse;
  }
  
  img {
    border: 0;
    -ms-interpolation-mode: bicubic;
  }
  
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #F8FAFC;
    padding: 40px 0;
  }
  
  .main {
    background-color: #ffffff;
    margin: 0 auto;
    width: 100%;
    max-width: 600px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
    border: 1px solid #F1F5F9;
  }
  
  .brand-strip {
    background-color: #246BFD;
    height: 6px;
    width: 100%;
  }
  
  .header {
    padding: 40px 40px 30px 40px;
    text-align: left;
    background-color: #ffffff;
  }
  
  .header-flex {
    display: table;
    width: 100%;
  }
  
  .logo-cell {
    display: table-cell;
    vertical-align: middle;
  }
  
  .info-cell {
    display: table-cell;
    vertical-align: middle;
    text-align: right;
  }
  
  .status-badge {
    background-color: #F1F5F9;
    color: #64748B;
    padding: 6px 12px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .content {
    padding: 0 40px 40px 40px;
    line-height: 1.8;
    font-size: 16px;
  }
  
  .footer {
    padding: 40px;
    text-align: center;
    background-color: #0F172A;
    color: #94A3B8;
  }
  
  .h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 20px 0;
    color: #0F172A;
    letter-spacing: -1px;
  }
  
  .p {
    margin: 0 0 20px 0;
    color: #475569;
  }
  
  .btn {
    background-color: #246BFD;
    color: #ffffff !important;
    padding: 18px 36px;
    text-decoration: none;
    border-radius: 16px;
    font-weight: 700;
    display: inline-block;
    font-size: 16px;
    box-shadow: 0 10px 15px -3px rgba(36, 107, 253, 0.3);
  }
  
  .accent-box {
    background-color: #F8FAFC;
    border-radius: 20px;
    padding: 24px;
    margin: 30px 0;
    border: 1px solid #F1F5F9;
  }
  
  .footer-links a {
    color: #ffffff;
    text-decoration: none;
    margin: 0 10px;
    font-weight: 600;
    font-size: 13px;
  }
  
  .social-icon {
    display: inline-block;
    margin: 0 8px;
    width: 32px;
    height: 32px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    vertical-align: middle;
    text-align: center;
  }
  
  .social-icon svg {
    width: 16px;
    height: 16px;
    margin-top: 8px;
    fill: #ffffff;
  }

  @media screen and (max-width: 600px) {
    .content { padding: 0 25px 30px 25px !important; }
    .header { padding: 30px 25px 20px 25px !important; }
    .h1 { font-size: 24px !important; }
  }
`;

const fbPath = 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z';
const xPath = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';
const igPath = 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z';
const ytPath = 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z';
const tkPath = 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';
const liPath = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

const renderLayout = (title: string, content: string, status: string = 'Secure Communication') => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${baseStyles}</style>
  </head>
  <body>
    <center class="wrapper">
      <table class="main" width="100%" cellpadding="0" cellspacing="0">
        <tr><td class="brand-strip"></td></tr>
        <tr>
          <td class="header">
            <div class="header-flex">
              <div class="logo-cell">
                <img src="https://fyndrx.com/logo-dark.png" alt="FyndRx" width="110">
              </div>
              <div class="info-cell">
                <span class="status-badge">${status}</span>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="content">
            ${content}
          </td>
        </tr>
        <tr>
          <td class="footer">
            <div style="margin-bottom: 25px;">
              <a href="https://www.facebook.com/fyndrx" class="social-icon"><svg viewBox="0 0 24 24"><path d="${fbPath}"/></svg></a>
              <a href="#" class="social-icon"><svg viewBox="0 0 24 24"><path d="${xPath}"/></svg></a>
              <a href="https://instagram.com/fyndrx_" class="social-icon"><svg viewBox="0 0 24 24"><path d="${igPath}"/></svg></a>
              <a href="https://www.youtube.com/@fyndrx_" class="social-icon"><svg viewBox="0 0 24 24"><path d="${ytPath}"/></svg></a>
              <a href="https://www.tiktok.com/@fyndrx_" class="social-icon"><svg viewBox="0 0 24 24"><path d="${tkPath}"/></svg></a>
              <a href="https://www.linkedin.com/company/fyndrx" class="social-icon"><svg viewBox="0 0 24 24"><path d="${liPath}"/></svg></a>
            </div>
            <div class="footer-links" style="margin-bottom: 25px;">
              <a href="#">Privacy</a>
              <a href="#">Help Center</a>
              <a href="#">Unsubscribe</a>
            </div>
            <p style="margin: 0; font-size: 12px; color: #64748B;">
              &copy; 2024 FyndRx Inc. All rights reserved.<br>
              Mayflower Building, Community 10, Tema, Ghana.
            </p>
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px;">
              This email was sent to you because you registered for FyndRx. Our platform provides secure access to verified pharmaceutical care.
            </div>
          </td>
        </tr>
      </table>
    </center>
  </body>
  </html>
`;

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Onboarding',
    description: 'Initial welcome email for new FyndRx users.',
    subject: 'Welcome to FyndRx - Your Health, Our Priority',
    html: renderLayout('Welcome', `
      <h1 class="h1">The future of pharmacy is here</h1>
      <p class="p">Hello,</p>
      <p class="p">We're thrilled to have you join our community. FyndRx is designed to bring you the best prices and most convenient access to verified medications across Ghana.</p>
      <div class="accent-box">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #246BFD;">Quick Start Guide:</h3>
        <table width="100%">
          <tr>
            <td style="padding-bottom: 10px; font-size: 14px;"><strong>1. Upload</strong> your prescription securely.</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; font-size: 14px;"><strong>2. Compare</strong> prices from multiple pharmacies.</td>
          </tr>
          <tr>
            <td style="font-size: 14px;"><strong>3. Order</strong> for home delivery or pickup.</td>
          </tr>
        </table>
      </div>
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="btn">Start Your Journey</a>
      </div>
      <p class="p">Need assistance? Our clinical team is available 24/7 to answer your questions.</p>
    `, 'Onboarding')
  },
  {
    id: 'otp',
    name: 'Security OTP',
    description: 'Verification code for login or sensitive actions.',
    subject: 'Your FyndRx Verification Code',
    html: renderLayout('Verification', `
      <div style="text-align: center;">
        <h1 class="h1">Verify your identity</h1>
        <p class="p">To keep your health data secure, please use the following one-time password to complete your login. This code expires in 10 minutes.</p>
        <div style="background-color: #F8FAFC; padding: 40px; border-radius: 24px; margin: 30px 0; border: 2px dashed #E2E8F0;">
          <span style="font-size: 42px; font-weight: 800; letter-spacing: 15px; color: #246BFD; font-family: monospace;">849203</span>
        </div>
        <p class="p" style="font-size: 13px; color: #94A3B8;">Security Tip: FyndRx staff will never ask for your password or OTP over the phone. If you did not request this, please change your password immediately.</p>
      </div>
    `, 'Security Alert')
  },
  {
    id: 'order-confirmed',
    name: 'Order Confirmation',
    description: 'Sent after a successful medication order.',
    subject: 'Order Confirmed - #FRX-98234',
    html: renderLayout('Order Confirmed', `
      <h1 class="h1">Order Received</h1>
      <p class="p">Thank you for your order. We've notified the pharmacy, and they are currently preparing your medications for dispatch.</p>
      <div class="accent-box" style="background-color: #0F172A; color: #ffffff; border: 0;">
        <table width="100%">
          <tr>
            <td style="font-weight: 600; opacity: 0.7;">Order ID</td>
            <td style="text-align: right; font-weight: 700;">#FRX-98234</td>
          </tr>
          <tr>
            <td style="font-weight: 600; opacity: 0.7;">Payment Method</td>
            <td style="text-align: right; font-weight: 700;">Mobile Money</td>
          </tr>
          <tr>
            <td style="font-weight: 600; opacity: 0.7;">Est. Delivery</td>
            <td style="text-align: right; font-weight: 700; color: #FE9615;">Today, 4:00 PM</td>
          </tr>
        </table>
      </div>
      <h3 style="font-size: 18px; margin: 30px 0 15px 0;">Items Ordered</h3>
      <table width="100%" style="margin-bottom: 30px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">Paracetamol 500mg <br><span style="font-size: 12px; color: #94A3B8;">Quantity: 2</span></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; text-align: right; font-weight: 600;">GHS 24.00</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">Amoxicillin 250mg <br><span style="font-size: 12px; color: #94A3B8;">Quantity: 1</span></td>
          <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; text-align: right; font-weight: 600;">GHS 45.00</td>
        </tr>
        <tr>
          <td style="padding: 20px 0; font-weight: 800; font-size: 18px;">Total Paid</td>
          <td style="padding: 20px 0; font-weight: 800; font-size: 18px; text-align: right; color: #246BFD;">GHS 69.00</td>
        </tr>
      </table>
      <div style="text-align: center;">
        <a href="#" class="btn">Track Your Delivery</a>
      </div>
    `, 'Transaction')
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Instructions for resetting a forgotten password.',
    subject: 'Reset your FyndRx password',
    html: renderLayout('Password Reset', `
      <h1 class="h1">Reset your password</h1>
      <p class="p">We received a request to reset the password for your account. If this was you, please click the button below to set a new password.</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="btn">Reset My Password</a>
      </div>
      <div class="accent-box">
        <p style="margin: 0; font-size: 13px; color: #64748B;">This link will expire in 2 hours for security reasons. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `, 'Security')
  },
  {
    id: 'appointment-confirmed',
    name: 'Appointment Confirmed',
    description: 'Sent when a telehealth consultation is scheduled.',
    subject: 'Consultation Confirmed - Dr. Sarah Mensah',
    html: renderLayout('Appointment Confirmed', `
      <h1 class="h1">You're scheduled!</h1>
      <p class="p">Your telehealth consultation with <strong>Dr. Sarah Mensah</strong> has been successfully confirmed. A medical specialist will be ready to see you at the scheduled time.</p>
      <div class="accent-box">
        <table width="100%">
          <tr>
            <td style="padding-bottom: 15px; border-bottom: 1px solid #E2E8F0;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; font-weight: 700; display: block; margin-bottom: 5px;">Date & Time</span>
              <span style="font-size: 16px; font-weight: 700; color: #0F172A;">Thursday, Oct 24 @ 10:30 AM</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 15px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; font-weight: 700; display: block; margin-bottom: 5px;">Consultation Type</span>
              <span style="font-size: 16px; font-weight: 700; color: #0F172A;">Video Call - General Practice</span>
            </td>
          </tr>
        </table>
      </div>
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="btn" style="background-color: #0F172A;">Prepare for Call</a>
      </div>
      <p class="p" style="font-size: 14px; color: #64748B;">Pro Tip: Find a quiet, well-lit room and ensure your microphone is working for the best experience.</p>
    `, 'Telehealth')
  },
  {
    id: 'order-shipped',
    name: 'Order Shipped',
    description: 'Notification that medications are on their way.',
    subject: 'Your medications are on their way!',
    html: renderLayout('Order Shipped', `
      <h1 class="h1">Package Dispatched</h1>
      <p class="p">Great news! Your order from <strong>Community 1 Pharmacy</strong> has been picked up by our dedicated courier team and is now en route to your location.</p>
      <div style="background-color: #F8FAFC; border: 2px solid #246BFD; border-radius: 24px; padding: 35px; text-align: center; margin: 35px 0; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; right: 0; background-color: #246BFD; color: white; font-size: 10px; font-weight: 800; padding: 5px 15px; border-radius: 0 0 0 15px;">LIVE TRACKING</div>
        <span style="display: block; font-size: 14px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Arriving In</span>
        <span style="font-size: 32px; font-weight: 800; color: #0F172A;">35 - 50 MINS</span>
      </div>
      <div style="text-align: center;">
        <a href="#" class="btn">Track Delivery Agent</a>
      </div>
      <p class="p" style="margin-top: 30px; font-size: 14px; text-align: center;">Please ensure someone is available at your delivery address to receive the package.</p>
    `, 'Logistics')
  }
];
