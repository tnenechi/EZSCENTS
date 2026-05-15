import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'EzScents <onboarding@resend.dev>';

export const sendOrderConfirmation = async (order: any) => {
  const { user, guestInfo, orderItems, totalPrice, _id } = order;
  const recipientEmail = user?.email || guestInfo?.email;
  const recipientName = user?.name || guestInfo?.name;

  if (!recipientEmail) return;

  const itemsHtml = orderItems.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Order Confirmation - EzScents #${_id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px;">
          <h1 style="text-align: center; color: #000; letter-spacing: 2px; text-transform: uppercase;">EzScents</h1>
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
            If you have any questions, reply to this email or contact support@ezscents.com
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

export const sendOrderStatusUpdate = async (order: any) => {
  const { user, guestInfo, status, _id } = order;
  const recipientEmail = user?.email || guestInfo?.email;
  const recipientName = user?.name || guestInfo?.name;

  if (!recipientEmail) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Order Status Updated - EzScents #${_id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px;">
          <h1 style="text-align: center; color: #000; letter-spacing: 2px; text-transform: uppercase;">EzScents</h1>
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
    console.error('Failed to send status update email:', error);
  }
};
