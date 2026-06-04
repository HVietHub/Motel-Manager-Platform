import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('Missing SMTP_USER or SMTP_PASS environment variables');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};


/**
 * Send an OTP verification email
 */
export const sendVerificationEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"HouseSea Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `[HouseSea] Mã xác thực tài khoản của bạn`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực tài khoản HouseSea</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #1f2116; padding: 30px 20px; text-align: center; }
          .logo { color: #fdb549; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
          .content { padding: 40px 32px; color: #3f3f46; line-height: 1.6; text-align: center; }
          .greeting { font-size: 20px; font-weight: 700; color: #1f2116; margin-bottom: 12px; }
          .otp-container { background-color: #fafaf8; border: 2px solid #f1f0ec; border-radius: 16px; padding: 32px; margin: 24px 0; }
          .otp-code { font-size: 48px; font-weight: 800; color: #ed7307; letter-spacing: 8px; margin: 0; text-shadow: 1px 1px 0px rgba(0,0,0,0.05); }
          .expiry { font-size: 13px; color: #8b9c38; margin-top: 12px; font-weight: 600; }
          .footer { background-color: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">HouseSea</h1>
          </div>
          
          <div class="content">
            <h2 class="greeting">Xác thực tài khoản</h2>
            <p>Sử dụng mã bên dưới để hoàn tất đăng ký. Mã có hiệu lực trong 10 phút.</p>
            
            <div class="otp-container">
              <p class="otp-code">${otp}</p>
              <p class="expiry">Hiệu lực: 10 phút</p>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8;">Nếu không phải bạn, hãy bỏ qua email này.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 HouseSea Platform. Developed by HVietHub.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await createTransporter().sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
};
