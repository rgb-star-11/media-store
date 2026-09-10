const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

exports.sendPasswordResetEmail = async ({ toEmail, mobile, resetUrl }) => {
  const mailText = `کاربر گرامی ${mobile}
درخواست فراموشی رمز شما دریافت گردید. لطفا از طریق لینک زیر نسبت به بازنشانی رمز جدید اقدام نمایید:
${resetUrl}`;

  const mailHtml = `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #18181b; color: #f4f4f5; padding: 24px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #27272a;">
      <h2 style="color: #f59e0b; font-size: 18px; margin-bottom: 16px;">بازنشانی رمز عبور</h2>
      <p style="font-size: 14px; line-height: 1.8; color: #e4e4e7;">
        کاربر گرامی <strong style="color: #f59e0b;">${mobile}</strong>
      </p>
      <p style="font-size: 14px; line-height: 1.8; color: #e4e4e7;">
        درخواست فراموشی رمز شما دریافت گردید. لطفا از طریق لینک زیر نسبت به بازنشانی رمز جدید اقدام نمایید:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #f59e0b; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; display: inline-block; font-size: 14px;">
          بازنشانی رمز ورود
        </a>
      </div>
      <p style="font-size: 11px; color: #71717a; text-align: center; word-break: break-all;">
        ${resetUrl}
      </p>
    </div>
  `;

  const transporter = createTransporter();

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Studio Portfolio" <no-reply@studioportfolio.com>',
      to: toEmail,
      subject: 'درخواست بازنشانی رمز عبور',
      text: mailText,
      html: mailHtml
    });
    console.log(`✅ Reset password email sent to ${toEmail}`);
  } else {
    console.log('\n======================================================');
    console.log(`📩 [DEV EMAIL LOG] Sent To: ${toEmail} (Mobile: ${mobile})`);
    console.log(mailText);
    console.log('======================================================\n');
  }

  return true;
};
