const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server validation done and ready for messages.");
  }
});

const email = (receiver, data) => {
  const generatedMailBody = `
    <table>
      <tr>
        <th>${data.city}: </th>
        <td>${data.temperature} k</td>
      </tr>
    </table>
  `;

  return {
    from: "abaran803@gmail.com",
    to: receiver,
    subject: "Weather Update!!",
    html: generatedMailBody,
  };
};

async function mailer(receiver, data) {
  return await transporter.sendMail(
    email(receiver, data)
  );
}

module.exports = mailer;
