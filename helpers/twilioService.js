const twilio = require('twilio');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOTP = async (phoneNumber) => {
  try {
    const verification = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({to: phoneNumber, channel: 'sms'});
    return verification.status;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

exports.verifyOTP = async (phoneNumber, code) => {
  try {
    const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({to: phoneNumber, code: code});
    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
};
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendEmail = async (to, subject, body) => {

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY);
  
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = body.replace(/\n/g, '<br>');
    sendSmtpEmail.sender = { name: "Edulley Study Abroad", email: process.env.BREVO_SENDER_EMAIL };
  
    try {
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully. MessageId:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error?.message||error);
      throw new Error('Failed to send email');
    }
  }