

const products = require('../model/prodectSchema');
const Category = require('../model/categorySchema'); 
const Coupon = require('../model/couponSchema')
const User =require('../model/userSchema')



const couponPage = async (req, res) => {
    try {
        const successMessage = req.flash('success'); 
        const errorMessage = req.flash('error'); 

        const Newcoupon= await Coupon.find()
        
        res.render('./admin/coupon', { success: successMessage, error: errorMessage ,Newcoupon});
        console.log(Newcoupon);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const addCoupon = async (req, res) => {
    console.log('fffffffffffuuuuuuuuuuuccccccccccccccccccckkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
    try {
        const { couponName, couponCode, discount, startDate, endDate } = req.body;
        const newCoupon = new Coupon({
            couponName,
            couponCode,
            discount,
            startDate,
            endDate,
            discountType: 'percentage',
        });

        await newCoupon.save();
        req.flash('success', 'Coupon added successfully');
        res.redirect('/admin/coupon-page');
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.couponCode === 1) {

            req.flash('error', 'Coupon with this code already exists');
        } else {
          
            req.flash('error', 'Internal Server Error');
        }
        res.redirect('/admin/coupon-page');
    }
}


const deletecoupon=async(req,res)=>{
    try {
        const couponId = req.params.id;
        await Coupon.findByIdAndDelete(couponId);
        res.redirect('/admin/coupon-page');


    } catch (error) {
        console.error(error);
        res.redirect('/admin/coupon-page');
    }
}



const showcoupon=async(req,res)=>{
    try {
        const currentDate = new Date();
        const Newcoupon= await Coupon.find()
        res.render('./user/usercoupons',{Newcoupon,currentDate})
        
    } catch (error) {
        
    }
}


const applyCoupon = async (req, res) => {
    try {
        const email = req.session.email;
        const code = req.body.couponCode;
        const total = req.body.total;
        let discount = 0;

        const user = await User.findOne({ email });
        const userId = user._id;

        const couponMatch = await Coupon.findOne({ couponCode: code });

        if (couponMatch) {
            if (couponMatch.status === true) {
                const currentDate = new Date();
                const startDate = couponMatch.startDate;
                const endDate = couponMatch.endDate;

                if (startDate <= currentDate && currentDate <= endDate) {

                    

                        if (couponMatch.status) {
                            const couponUsed = await Coupon.findOne({
                                couponCode: couponMatch.couponCode,
                                'usedBy.userId': userId,
                            });

                            if (couponUsed) {
                                return res.json({ error: 'You have used the coupon once' });
                            } else {

                                if (couponMatch.discountType === 'percentage') {
                                    discount = total * (couponMatch.discount / 100);
                                    req.session.grandTotal = total - discount;
                                    couponMatch.usedBy.push({
                                        userId: userId,
                                        usedAt: new Date(),
                                    });
                                    await couponMatch.save();
                                    return res.status(200).json({ success: true, discount, grandTotal: req.session.grandTotal });
                                } else {
                                    return res.json({ error: 'Invalid discount type' });
                                }
                            }
                        } else {
                            return res.json({ error: 'Coupon limit reached' });
                        }
                    
                } else {
                    return res.json({ error: 'Coupon is expired' });
                }
            } else {
                return res.json({ error: 'Coupon is not active' });
            }
        } else {
            return res.json({ error: 'No such coupon found' });
        }
    } catch (error) {
        console.error(error);
        res.json({ error: 'Some error occurred' });
    }
};






module.exports = {
    couponPage,
    addCoupon,
    deletecoupon,
    showcoupon,
    applyCoupon
};




