import nodemailer from "nodemailer";

export default async function sendEmail({ email, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "singhisabhaypratap@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: "singhisabhaypratap@gmail.com",
    to: email,
    subject: subject,
    html: html,
  };

  await transporter.sendMail(mailOptions);
}
