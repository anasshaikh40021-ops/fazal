import nodemailer from "nodemailer";

/* =======================
   EMAIL TRANSPORTER
======================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =======================
   BASE EMAIL TEMPLATE
======================= */
const emailTemplate = ({
  title,
  message,
  order,
  paymentMethod,
  paymentStatus,
}) => {
  return `
  <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:20px; border-radius:6px">
      
      <h2 style="color:#000;">${title}</h2>
      <p>${message}</p>

      <hr />

      <h3>Order Summary</h3>

      <table width="100%" cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse; font-size:14px">
        <tr>
          <th align="left">Product</th>
          <th align="center">Qty</th>
          <th align="right">Price</th>
        </tr>

        ${
          order?.items
            ?.map(
              (item) => `
          <tr>
            <td>${item.name}</td>
            <td align="center">${item.quantity || 1}</td>
            <td align="right">₹${item.price}</td>
          </tr>
        `
            )
            .join("") || ""
        }

        <tr>
          <td colspan="2" align="right"><strong>Total</strong></td>
          <td align="right"><strong>₹${order?.amount}</strong></td>
        </tr>
      </table>

      <p style="margin-top:15px">
        <strong>Payment Method:</strong> ${paymentMethod}<br/>
        <strong>Payment Status:</strong> ${paymentStatus}
      </p>

      <p style="margin-top:20px">
        We’ll notify you when your order is shipped 🚚
      </p>

      <p style="color:#888; font-size:12px; margin-top:30px">
        © ${new Date().getFullYear()} Fazal Store. All rights reserved.
      </p>
    </div>
  </div>
  `;
};



/* =======================
   SEND EMAIL FUNCTION
======================= */
const sendEmail = async ({
  email,
  subject,
  title,
  message,
  order,
  paymentMethod,
  paymentStatus,
}) => {
  const html = emailTemplate({
    title,
    message,
    order,
    paymentMethod,
    paymentStatus,
  });

  await transporter.sendMail({
    from: `"Fazal Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

export default sendEmail;
