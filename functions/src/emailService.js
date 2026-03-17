/**
 * Email Service using Nodemailer
 *
 * Configure email provider credentials in Firebase Functions config:
 * firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
 */

const nodemailer = require('nodemailer');
const functions = require('firebase-functions');

// Create reusable transporter
const createTransporter = () => {
  // In production, use Firebase Functions config
  // const emailConfig = functions.config().email;

  // For now, create a test account (replace with real SMTP in production)
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: functions.config().email?.user || process.env.EMAIL_USER,
      pass: functions.config().email?.password || process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send Welcome Email
 */
exports.sendWelcomeEmail = async (to, displayName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"RentMate Platform" <noreply@rentmate.com>',
      to,
      subject: 'Welcome to RentMate! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to RentMate!</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>

              <p>Thank you for joining RentMate - the platform connecting equipment owners with renters!</p>

              <p><strong>Here's what you can do:</strong></p>
              <ul>
                <li>🔍 Browse thousands of equipment available for rent</li>
                <li>💰 List your own equipment and earn money</li>
                <li>⭐ Rate and review equipment</li>
                <li>📊 Track your rental history and earnings</li>
              </ul>

              <p style="text-align: center;">
                <a href="https://rentmate-c7360.web.app" class="button">Start Browsing Equipment</a>
              </p>

              <p>If you have any questions, feel free to reach out to our support team.</p>

              <p>Happy renting!<br>The RentMate Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RentMate. All rights reserved.</p>
              <p>This email was sent to ${to}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${to}:`, result.messageId);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send Rental Request Email to Owner
 */
exports.sendRentalRequestEmail = async ({ to, ownerName, renterName, equipmentName, startDate, endDate, totalPrice, rentalId }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"RentMate Platform" <noreply@rentmate.com>',
      to,
      subject: `New Rental Request for ${equipmentName} 📥`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Rental Request!</h1>
            </div>
            <div class="content">
              <p>Hi ${ownerName},</p>

              <p><strong>${renterName}</strong> wants to rent your equipment!</p>

              <div class="details">
                <h3>${equipmentName}</h3>
                <p><strong>Rental Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
                <p><strong>Total Price:</strong> $${totalPrice}</p>
                <p><strong>Request ID:</strong> #${rentalId.slice(-8)}</p>
              </div>

              <p style="text-align: center;">
                <a href="https://rentmate-c7360.web.app/owner-dashboard" class="button" style="background: #28a745;">Approve Request</a>
                <a href="https://rentmate-c7360.web.app/owner-dashboard" class="button" style="background: #dc3545;">Decline Request</a>
              </p>

              <p>Log in to your dashboard to review the request details and make a decision.</p>

              <p>Best regards,<br>The RentMate Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RentMate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Rental request email sent to ${to}:`, result.messageId);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending rental request email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send Rental Approval Email to Renter
 */
exports.sendRentalApprovalEmail = async ({ to, renterName, equipmentName, ownerName, ownerEmail, rentalId }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"RentMate Platform" <noreply@rentmate.com>',
      to,
      subject: `Rental Approved: ${equipmentName} ✅`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Rental Approved!</h1>
            </div>
            <div class="content">
              <p>Hi ${renterName},</p>

              <div class="success">
                <p><strong>Great news!</strong> Your rental request has been approved!</p>
              </div>

              <p><strong>Equipment:</strong> ${equipmentName}</p>
              <p><strong>Owner:</strong> ${ownerName}</p>
              <p><strong>Contact:</strong> ${ownerEmail}</p>

              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Complete the payment for your rental</li>
                <li>Contact the owner to arrange pickup</li>
                <li>Enjoy your rental!</li>
              </ol>

              <p style="text-align: center;">
                <a href="https://rentmate-c7360.web.app/payment/${rentalId}" class="button">Proceed to Payment</a>
              </p>

              <p>Please contact the owner at ${ownerEmail} to coordinate pickup details.</p>

              <p>Happy renting!<br>The RentMate Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RentMate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Rental approval email sent to ${to}:`, result.messageId);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending rental approval email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send Rental Rejection Email to Renter
 */
exports.sendRentalRejectionEmail = async ({ to, renterName, equipmentName, rentalId }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"RentMate Platform" <noreply@rentmate.com>',
      to,
      subject: `Rental Request Update: ${equipmentName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rental Request Update</h1>
            </div>
            <div class="content">
              <p>Hi ${renterName},</p>

              <div class="warning">
                <p>Unfortunately, your rental request for <strong>${equipmentName}</strong> has been declined by the owner.</p>
              </div>

              <p>Don't worry! There are many other great equipment options available for rent.</p>

              <p style="text-align: center;">
                <a href="https://rentmate-c7360.web.app/browse" class="button">Browse Similar Equipment</a>
              </p>

              <p>Thank you for using RentMate. We hope you find what you need!</p>

              <p>Best regards,<br>The RentMate Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RentMate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Rental rejection email sent to ${to}:`, result.messageId);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending rental rejection email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};
