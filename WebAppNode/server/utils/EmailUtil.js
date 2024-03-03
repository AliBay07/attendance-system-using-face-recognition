const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const client = Sib.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

module.exports.sendEmail = async (to, password) => {
  const sender = {
    email: process.env.GMAIL_USER,
    name: "ASFR",
  };

  const receivers = [
    {
      email: to,
    },
  ];

  tranEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "Account Setup Confirmation - Access Details",
      textContent: `
      Dear user,

      We are delighted to welcome you to our company. This email contains your login credentials to access your account:
      
      Email: ${to}
      Password: ${password}
      
      Please note that for security reasons, we recommend that you change your password as soon as possible after logging in. To do so, simply go to your account settings and follow the instructions.
      
      If you have any questions or concerns, please do not hesitate to contact our HR team. We are always here to help you.
      
      Best regards
      Hr Team.
          `,
      params: {
        role: "Frontend",
      },
    })
    .then(console.log)
    .catch(console.log);
};
