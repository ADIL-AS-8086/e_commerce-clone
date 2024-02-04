function generateOTP() {
  // Implement your OTP generation logic here
  console.log("otp crating");
  return Math.floor(1000 + Math.random() * 9000); // Example: 4-digit OTP

}

module.exports = { generateOTP };
  