const Referral = require("../model/refferalSchema");
const User = require("../model/userSchema");
const WalletTransaction = require('../model/WalletSchema')


const getWallet = async (req, res) => {
    try {
        const email = req.session.email;
        const UserData = await User.findOne({ email }).populate('referredBy referredUsers');
        
        const referred = UserData.referredBy;

        const walletTransactions = await WalletTransaction.find({ user: UserData._id }).populate('user'); 
        
        console.log(UserData, referred, 'cbvxxxxxxxxxxxxxxxxghsadftwyerftywhgdsaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        
        res.render('./user/wallet', { UserData, referred, transactions: walletTransactions });
    } catch (error) {
        console.error("Error while rendering the wallet page:", error);
    }
}



const refferalWallet = async (req, res) => {
    try {
        const newrefferal = await Referral.findOne()
        res.render('./admin/refferal', { newrefferal })
        console.log('eeeeeeeeeeeeeeeEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    } catch (error) {
        console.error("error while rendering the refferal page:",error)
    }
}

const updateReferralAmount = async (req, res) => {
    const { refferalAmount } = req.body;
    try {
        const referral = await Referral.findOne();

        if (!referral) {
            await Referral.create({ amount: refferalAmount });
        } else {
            referral.amount = refferalAmount;
            await referral.save();
        }

        res.render("admin/refferal", { message: "Referral amount updated successfully", newrefferal: { amount: refferalAmount } });

    } catch (error) {
        console.error("Error updating referral amount:", error);
        res.status(500).send("Internal Server Error");
    }
};





module.exports = {
      updateReferralAmount,
    //   getWallet,
    refferalWallet,
    getWallet
};