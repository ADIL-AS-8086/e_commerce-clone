const User=require('../model/userSchema')


const verifyUser = async(req, res, next) => {
    if (req.session.userlogged) {
      const username = req.session.email;
      const user = await User.findOne({ email: username });
      if (user && user.status === false ) {
        req.session.userlogged = false;
        return res.redirect('/user/signin');
      }
      next();
    } else {
      res.redirect("/user/signin");
    }  
  };
  
  
  const userExist = async(req, res, next) => {
    if (req.session.userlogged) {
      const username = req.session.email;
      const user = await User.findOne({ email: username });
      if (user && user.status === false) {
        req.session.userlogged = false;
        return res.redirect('/user/signin');
      }
      res.redirect("/user/user-home");
    } else {
      next();
    }
  };
  
  module.exports = { 
      verifyUser ,
      userExist
  };