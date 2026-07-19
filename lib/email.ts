import nodemailer from 'nodemailer';

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  // Try to use real SMTP if provided in environment variables
  const smtpHost = process.env.EMAIL_HOST || '';
  const smtpPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
  const smtpUser = process.env.EMAIL_USER || '';
  const smtpPass = process.env.EMAIL_PASS || '';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Anyprint Avenue" <${smtpUser}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error("Failed to send email via SMTP", error);
      return false;
    }
  } else {
    // Fallback: Just log the email to console if SMTP is not configured
    console.log('\n=======================================');
    console.log(`[DEVELOPMENT] EMAIL INTERCEPTED`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html.replace(/<[^>]+>/g, '')}`); // Simple text extraction
    console.log('=======================================\n');
    console.log('Note: To send real emails, please configure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS in your .env file.');
    return true;
  }
};
