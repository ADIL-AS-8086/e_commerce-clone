const nodemailer = require("nodemailer");
require("dotenv").config();
console.log(process.env.MAIL_USER,"USER");
console.log(process.env.MAIL_PASSWORD,"PASSWORD");
    console.log("node mailer..");
  // Create a Transporter object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  transporter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        console.log("email ready");
        console.log(success);
    }
})

const sendMail = async (mailOptions) =>{
  try{
    await transporter.sendMail(mailOptions)
    console.log("email send");
    return
  }catch(err){
console.log(err);
  }
}



module.exports=sendMail