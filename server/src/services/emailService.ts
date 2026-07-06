import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "sscent448@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SUPPORT_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM_EMAIL = SUPPORT_EMAIL
  ? `"Secret Scents" <${SUPPORT_EMAIL}>`
  : '"Secret Scents" <no-reply@secretscents.com>';

export const sendOrderConfirmation = async (order: any) => {
  const { user, guestInfo, orderItems, totalPrice, _id } = order;
  const recipientEmail = user?.email || guestInfo?.email;
  const recipientName = user?.name || guestInfo?.name;

  if (!recipientEmail) return;

  const itemsHtml = orderItems
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
    </tr>
  `,
    )
    .join("");

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Order Confirmation - Secret Scents #${_id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px;">
          <h1 style="text-align: center; color: #000; letter-spacing: 2px; text-transform: uppercase;">Secret Scents</h1>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p>Hello ${recipientName},</p>
          <p>Thank you for your order! We've received your request and are currently processing it. Here are your order details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase;">Item</th>
                <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase;">Qty</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 20px 10px 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; font-size: 18px;">₦${totalPrice.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; margin-top: 40px;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Luxury Scent Experience</p>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            If you have any questions, reply to this email or contact ${SUPPORT_EMAIL}
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
};

export const sendOrderStatusUpdate = async (order: any) => {
  const { user, guestInfo, status, _id } = order;
  const recipientEmail = user?.email || guestInfo?.email;
  const recipientName = user?.name || guestInfo?.name;

  if (!recipientEmail) return;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Order Status Updated - Secret Scents #${_id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px;">
          <h1 style="text-align: center; color: #000; letter-spacing: 2px; text-transform: uppercase;">Secret Scents</h1>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p>Hello ${recipientName},</p>
          <p>Your order status has been updated to: <strong>${status}</strong>.</p>
          
          <div style="margin: 40px 0; padding: 20px; border: 1px solid #000; text-align: center;">
            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Status: ${status}</p>
          </div>

          <p>You can track your order journey in your account dashboard or by visiting our website.</p>

          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; margin-top: 40px;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Your Journey Continues</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send status update email:", error);
  }
};

export const sendWelcomeEmail = async (user: any) => {
  const { email, name } = user;
  if (!email) return;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to Secret Scents - Define Your Presence`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px;">
          <h1 style="text-align: center; color: #000; letter-spacing: 2px; text-transform: uppercase;">Secret Scents</h1>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p>Hello ${name},</p>
          <p>Welcome to <strong>Secret Scents</strong>. We are thrilled to have you join our exclusive community of luxury fragrance enthusiasts.</p>
          <p>Discover our curated collection of premium scents designed to define your presence and leave a lasting impression.</p>
          
          <div style="margin: 40px 0; text-align: center;">
            <a href="${CLIENT_URL}/shop" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: inline-block;">Start Exploring</a>
          </div>

          <p>As a member, you can track orders, save default delivery addresses, and enjoy faster checkouts.</p>

          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; margin-top: 40px;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Luxury Scent Experience</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

export const sendPasswordResetEmail = async (user: any, resetUrl: string) => {
  const { email, name } = user;
  if (!email) return;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset Your Password - Secret Scents`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px;">
          <h1 style="text-align: center; color: #000; letter-spacing: 2px; text-transform: uppercase;">Secret Scents</h1>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p>Hello ${name},</p>
          <p>You are receiving this email because you (or someone else) requested to reset the password for your account.</p>
          <p>Please click the button below to choose a new password. This link is valid for 1 hour.</p>
          
          <div style="margin: 40px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #D4AF37; color: #000; padding: 15px 30px; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>

          <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>

          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; margin-top: 40px;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Secret Scents Security</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
};
