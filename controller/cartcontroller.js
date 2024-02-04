const mongoose = require('mongoose');
const Cart = require('../model/cartSchema');
const products = require('../model/prodectSchema')
const User = require('../model/userSchema');

const cartpage = async (req, res) => {
    try {
        const email = req.session.email;
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const userId = userData._id;
        let userCart = await Cart.findOne({ user: userId }).populate('cartItems.products');

        if (!userCart) {
            userCart = new Cart({ user: userId, cartItems: [], TotalAmount: 0 });
        }

        console.log(userCart);

        let totalAmount = 0;

        if (userCart && userCart.cartItems) {
            userCart.cartItems.forEach(async (item) => {
                if (item.products && item.products.price) {
                    let productPrice = item.products.price;

       
                    if (item.products.offer && item.products.offer.discountPercentage > 0) {
                        productPrice = item.products.Discountedprice;
                    }

                    item.totalPrice = item.quantity * productPrice;
                    totalAmount += item.totalPrice;
                }
            });

            userCart.TotalAmount = totalAmount;
            console.log(userCart.TotalAmount, '88888888888888888');
        }

        await userCart.save();

        res.render('./user/userCart', { userCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const addToCart_post = async (req, res) => {
    try {
        const productId = req.params.id;
        const { size, sizeId } = req.body;
        const email = req.session.email;
        console.log(size, '----?-??_??_____', sizeId);
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const userId = userData._id;

        let userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            userCart = new Cart({ user: userId, cartItems: [] });
        }

        const existingItem = userCart.cartItems.find(item => {
            return item.products.equals(new mongoose.Types.ObjectId(productId)) && item.size === size;
        });

        if (existingItem) {
            const product = await products.findById(productId);

            if (product) {
                const variant = product.variant.find(v => v.size === size);
                if (variant && existingItem.quantity + 1 > variant.quantity) {
                    return res.status(400).json({ error: 'Not enough stock available for the selected size.' });
                }

                if (product.offer && product.offer.discountPercentage > 0) {
                    existingItem.price = product.Discountedprice; 
                } else {
                    existingItem.price = product.price; 
                }
            }

            existingItem.quantity += 1;
        } else {
            const product = await products.findById(productId);

            if (!product) {
                return res.status(404).json({ error: 'Product not found.' });
            }

            const offerPrice = product.offer && product.offer.discountPercentage > 0
                ? product.Discountedprice 
                : product.price; 

            userCart.cartItems.push({
                products: new mongoose.Types.ObjectId(productId),
                quantity: 1,
                size: size,
                price: offerPrice,
            });
        }

        await userCart.save();

        console.log(userCart);

        res.status(200).json({ message: 'Item added to the cart successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const updateCartItemQuantity=async(req,res)=>{
   console.log('@@@@@@@@@@');
    try {
console.log("2222221111111111");
        const  itemId= req.params.id;
        const { quantity } = req.body;
        const userCart=await Cart.findOneAndUpdate(
            {'cartItems._id':itemId},
            {$set:{'cartItems.$.quantity':quantity}},
            {new:true}

        )
        if (!userCart) {
            return res.status(404).json({ error: 'Item not found in the cart.' });
        }

        res.status(200).json({ message: 'Quantity updated successfully.' });



        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        
    }


}


const deleteCartItem = async (req, res) => {
    try {
        const itemId = req.params.id;

        const userCart = await Cart.findOneAndUpdate(
            { 'cartItems._id': itemId },
            { $pull: { cartItems: { _id: itemId } } },
            { new: true }
        );

        if (!userCart) {
            return res.status(404).json({ error: 'Item not found in the cart.' });
        }

        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const checkQuantity=async(req,res)=>{
    try {
        const { ProId, quantity,size } = req.params;
        console.log(ProId);
        console.log(quantity);

        const product = await products.findById(ProId);

        const variant = product.variant.find((v) => v.size === size);

    if (variant && variant.quantity >= quantity) {
      res.status(200).json({ message: 'Quantity available.' });
      console.log("@@@@@@@@@@");
    } else {
      res.status(400).json({ error: 'Not enough stock available for the selected quantity.' });
    }
    } catch (error) {
        console.error("error while quantity checking:",error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}






module.exports = {
    addToCart_post,
    cartpage,
    updateCartItemQuantity,
    deleteCartItem,
    checkQuantity
};


