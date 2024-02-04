const OTP = require("../model/otpSchema");
const { generateOTP } = require("./generateOTP");
const sendMail = require("../Auth/nodeMail");
// console.log('@@@@@@############');
async function sendOTP(email) {
  console.log(email,"this user email..");
  const otp =await generateOTP();
  console.log("created otp ",otp);

  try {
    // Save the OTP in the database
    const newotp = await OTP.findOneAndUpdate(
      { email },
      { $set: { otp, isExpired: false } },
      { upsert: true }
    );
    console.log("insrted otp.......",newotp);

    // Configure email options
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "OTP Verification",
      text:` This is your email for otp verification and this  Your OTP : ${otp}`,
    };
    console.log("mail sented,,,,,,,,",mailOptions);

    // Send the email with OTP
    const mailResponse = await sendMail(mailOptions);

    return {
      mailResponse,
      newotp,
      otp,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error; // Propagate the error to the caller
  }
}

module.exports = {
  sendOTP,
};
