
const Wishlist= require('../model/wishlistSchema')
const User= require('../model/userSchema')
const products=require('../model/prodectSchema')



const wishlistpage = async (req, res) => {
    try {
        const email = req.session.email;
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const userId = userData._id;
        const userWishlist = await Wishlist.findOne({ user: userId }).populate('products');
          
        console.log(userWishlist,'1111111111000000000000000000111111111111111111101111111111111111110000000000000000000000');
        if (!userWishlist) {
         
            return res.render('./user/wishlist', { userWishlist});
        }

        res.render('./user/wishlist', { userWishlist });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const addtowishlist = async (req, res) => {
    console.log('......................bvcxxxhfjdsgaueyrtquikyyyjkamhgwteauykwetgkjahgseftuyaerghjsdzgfhjs');
    try {
        const productId = req.params.id;
        const email = req.session.email;

     
        const userData = await User.findOne({ email: email });

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userData._id;
        console.log('userId', userId);

        const userWishlist = await Wishlist.findOneAndUpdate(
            { user: userId },
            { $addToSet: { products: productId } },
            { new: true, upsert: true }
        );

        console.log(',,,,,,,,,,,,,,,,,,,,,,,,,,', userWishlist);
        res.status(200).json({ message: 'Product added to wishlist successfully', wishlist: userWishlist });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




module.exports={
    wishlistpage,
    addtowishlist
}