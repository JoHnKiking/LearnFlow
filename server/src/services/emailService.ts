import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || 'LearnFlow <noreply@learnflow.app>';

export class EmailService {
  static async sendVerificationCode(email: string, code: string): Promise<void> {
    const html = `
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1a1a2e;border-radius:16px;color:#e8e8ff">
        <h2 style="color:#7b75d8;margin:0 0 8px">LearnFlow</h2>
        <p style="font-size:18px;font-weight:600;margin:16px 0 8px;color:#fff">邮箱验证码</p>
        <p style="color:#a0a0c0;font-size:14px;margin:0 0 24px">您正在注册 LearnFlow 账号，请输入以下验证码完成验证：</p>
        <div style="background:#2a2a4a;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#7b75d8;font-family:'Courier New',monospace">${code}</span>
        </div>
        <p style="color:#888;font-size:12px;margin:0">验证码 10 分钟内有效，请勿泄露给他人。<br/>如果这不是您的操作，请忽略此邮件。</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0 0"/>
        <p style="color:#666;font-size:11px;margin:8px 0 0">LearnFlow — 开启你的技能冒险之旅</p>
      </div>
    `;

    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'LearnFlow 邮箱验证码',
      html,
    });
  }

  static async testConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      console.log('[EmailService] SMTP 连接测试成功');
      return true;
    } catch (error) {
      console.error('[EmailService] SMTP 连接测试失败:', error);
      return false;
    }
  }
}
