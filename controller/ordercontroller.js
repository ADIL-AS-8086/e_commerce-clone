const { log } = require('console')
const mongoose = require('mongoose');
const order = require('../model/ordersShema')
const cart = require('../model/cartSchema')
const User = require('../model/userSchema')
const product = require('../model/prodectSchema')
const razorpay = require("../util/razorpay");
const walletTransaction = require('../model/WalletSchema')
const crypto = require('crypto');


const pdf = require("../util/salespdf");
const { isValid, parseISO } = require('date-fns');


require('dotenv').config()


const checkoutpage = async (req, res) => {
    try {
        const email = req.session.email;
        const UserData = await User.findOne({ email });
        console.log(UserData,'---------------------');
        const userCart = await cart.findOne({ user: UserData._id }).populate('cartItems.products');
        const wallet = await walletTransaction.findOne({ user: UserData._id });
        console.log(wallet,'fghjjjjjjjjjjjjjjjjjjjdddddddddd');
      
  

      let totalAmount = 0;

        if (userCart && userCart.cartItems) {
            userCart.cartItems.forEach(item => {
                let price = item.products.price;

                if (item.products.offer && item.products.offer.discountPercentage > 0) {
                    const discount = (item.products.offer.discountPercentage / 100) * price;
                    price -= discount;
                }

                item.totalPrice = item.quantity * price;
                totalAmount += item.totalPrice;
            });

            userCart.TotalAmount = totalAmount;
            req.session.grandTotal = userCart.TotalAmount;
        }

        // console.log(userCart.TotalAmount, '%%%%%%%%%%%%%%%%%%%%%');

        if (!UserData) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.render('./user/userCheckout', { UserData, userCart ,wallet});
        console.log('@@@@@', UserData.wallet);
        // console.log('#######', userCart);//
      
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};




const orderSuccess = async (req, res) => {
    try {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log(req.body, "@#@#@########");
        const PaymentMethod = req.body.payment;
        const Address = req.body.address;
        const Email = req.session.email;
        const user = await User.findOne({ email: Email });
        const userid = user._id;
        const totalAmount = req.session.grandTotal;

        console.log(totalAmount, userid, Email, Address, PaymentMethod, "!@#$%^&*(");

        const userCart = await cart.findOne({ user: userid }).populate(
            "cartItems.products"
        );

        if (!userCart) {
            console.error("No cart found for the user.");
            return res.render("error/404");
        }

        const newItems = [];

        for (const item of userCart.cartItems) {
            const productId = item.products;
            const quantityInCart = item.quantity;
            const size = item.size;

            const products = await product.findById(productId);

            if (products) {
                const variant = products.variant.find((v) => v.size === size);

                if (variant) {
                    const availableStock = variant.quantity;

                    if (quantityInCart > availableStock) {
                        console.error(
                            `Not enough stock available for product ${productId}, size ${size}`
                        );
                        return res.json({
                            error: "Not enough stock available for product",
                        });
                    }

                    const orderingprice = products.offer && products.offer.discountPercentage > 0
                        ? products.Discountedprice
                        : products.price;

                    const offer = products.offer && products.offer.discountPercentage > 0
                        ? products.offer.discountPercentage
                        : null;

                    newItems.push({
                        productId: productId,
                        quantity: quantityInCart,
                        size: size,
                        orderingprice: orderingprice,
                        offer: offer,
                    });

                    console.log(
                        orderingprice,
                        offer,
                        '<<<<>>>>>><<<<>>>>>>>>>><<<<<<<<>>>>>>>>>>>>>><<<<<<<<<>>>>>>>>>'
                    );
                } else {
                    console.error(`Size ${size} not found for product ${productId}`);
                    return res.json({ error: "Size not found for product" });
                }
            } else {
                console.error(`Product not found with ID ${productId}`);
                return res.json({ error: "Product not found" });
            }
        }

        const address = await User.findOne({
            _id: userid,
            address: {
                $elemMatch: { _id: new mongoose.Types.ObjectId(Address) },
            },
        });

        const add = {
            Name: address.address[0].name,
            Address: address.address[0].address,
            Pincode: address.address[0].pincode,
            City: address.address[0].city,
            State: address.address[0].state,
            Mobile: address.address[0].mobile,
        };

        const currentDate = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
        });

        const newOrders = new order({
            UserId: userid,
            Items: newItems,
            OrderDate: currentDate,
            ExpectedDeliveryDate: new Date(
                Date.now() + 4 * 24 * 60 * 60 * 1000
            ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
            TotalPrice: totalAmount,
            Address: add,
            PaymentMethod: PaymentMethod,
        });

        const orders = await newOrders.save();
        console.log(
            orders,
            '**!!*!*!*!*!*!*!*!*!*!*!**!*!*!**!*!*'
        );

        for (const item of orders.Items) {
            const productId = item.productId;
            console.log(productId, '222222222222222222222222');

            const products = await product.findById(productId);
            console.log(products);
            if (products) {
                let size = item.size;
                console.log('======', size);

                let variants;
                for (const variant of products.variant) {
                    if (variant.size === size) {
                        variants = variant;
                        break;
                    }
                }

                if (variants) {
                    console.log(variants);

                    const updatedQuantity = variants.quantity - item.quantity;
                    console.log(
                        updatedQuantity,
                        '!.!>1>!!>!.!>!>!>>!>!.!>>!.!.!>>`1.!.'
                    );
                    if (updatedQuantity < 0) {
                        variants.quantity = 0;
                        products.Status = "Out of Stock";
                    } else {
                        variants.quantity = updatedQuantity;
                        await products.save();
                    }
                }
            }
        }
        console.log('MMMMMMMMMUUUUUUUUHHHHHHHHHHHHAAAAAAAAAAAAAAMMMMMMMMMMEEEEEEEDDDDDDDD');

        await cart.findByIdAndDelete(userCart._id);

        console.log(PaymentMethod,'payment method is .....');
        if (PaymentMethod === "COD") {
            console.log(PaymentMethod,'payment method is ..... enterd');

                        res.json({ codSuccess: true });
            
                    } else if (PaymentMethod === "wallet") {
                        console.log(-totalAmount,'total amount');
                        const user = await User.findById(userid);
                        if (user.wallet < totalAmount) {
                            return res.status(400).json({ error: 'Insufficient wallet balance' });
                        }
                        user.wallet -= totalAmount;
                        await user.save();
                        console.log(user,"walet amount minused");

                        const walletTransactions = new walletTransaction({
                            user: userid,
                            amount: totalAmount,
                            description: "Used For Purchase",
                            transactionType: "debit",
                        });
            
            
                        
                        await walletTransactions.save();
                        console.log(walletTransactions,'wallet transaction seavedkljk');

                        const orderwallet = await order.findByIdAndUpdate(orders._id, {
                            PaymentStatus: "Paid",
                            PaymentMethod: "Wallet",
                        });
            
                        res.json({ codSuccess: true });
            
                    } else {
                        try {
                            const order = {
                                amount: totalAmount,
                                currency: "INR",
                                receipt: orders._id ,
                            };
                            console.log(orders._id,'TTTTTTTTTTTTTTTTTTTTTTAAAAAAAAAAAAAAAJJJJJJJJJJJJJJJUUUUUUUUUUUUUUUUUUUUUNNNNNNNNNNNNNN');
                            const createdOrder = await razorpay.createRazorpayOrder(order);
                    
                            console.log("payment response", createdOrder);
                    
                            res.json({ online: true, createdOrder, order });
                            console.log('1111111111111111111111111');
                        } catch (err) {
                            console.log("!@#$%^#%^$%@#!#$%^%^$%^$");
                            console.log(err);
                            return res.status(500).send(`Internal Server Error: ${err.message}`);
                        }
                    }
                    
    } catch (error) {
        console.error("Error processing order success:", error);
        return res.status(500).send(`Internal Server Error: ${error.message}`);
    }
};














// const orderSuccess = async (req, res) => {
//     try {
//         console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
//         console.log(req.body, "@#@#@########");
//         const PaymentMethod = req.body.payment;
//         const Address = req.body.address;
//         const Email = req.session.email;
//         const user = await User.findOne({ email: Email });
//         const userid = user._id;
//         const totalAmount = req.session.grandTotal;

//         console.log(totalAmount, userid, Email, Address, PaymentMethod, "!@#$%^&*(");

//         const userCart = await cart.findOne({ user: userid }).populate(
//             "cartItems.products"
//         );

//         if (!userCart) {
//             console.error("No cart found for the user.");
//             return res.render("error/404");
//         }

//         const newItems = [];

//         for (const item of userCart.cartItems) {
//             const productId = item.products;
//             const quantityInCart = item.quantity;
//             const size = item.size;

//             const products = await product.findById(productId);

//             if (products) {
//                 const variant = products.variant.find((v) => v.size === size);

//                 if (variant) {
//                     const availableStock = variant.quantity;

//                     if (quantityInCart > availableStock) {
//                         console.error(
//                             `Not enough stock available for product ${productId}, size ${size}`
//                         );
//                         return res.json({
//                             error: "Not enough stock available for product",
//                         });
//                     }

//                     const orderingprice = products.offer && products.offer.discountPercentage > 0
//                         ? products.Discountedprice
//                         : products.price;

//                     const offer = products.offer && products.offer.discountPercentage > 0
//                         ? products.offer.discountPercentage
//                         : null;

//                     newItems.push({
//                         productId: productId,
//                         quantity: quantityInCart,
//                         size: size,
//                         orderingprice: orderingprice,
//                         offer: offer,
//                     });

//                     console.log(
//                         orderingprice,
//                         offer,
//                         '<<<<>>>>>><<<<>>>>>>>>>><<<<<<<<>>>>>>>>>>>>>><<<<<<<<<>>>>>>>>>'
//                     );
//                 } else {
//                     console.error(`Size ${size} not found for product ${productId}`);
//                     return res.json({ error: "Size not found for product" });
//                 }
//             } else {
//                 console.error(`Product not found with ID ${productId}`);
//                 return res.json({ error: "Product not found" });
//             }
//         }

//         const address = await User.findOne({
//             _id: userid,
//             address: {
//                 $elemMatch: { _id: new mongoose.Types.ObjectId(Address) },
//             },
//         });

//         const add = {
//             Name: address.address[0].name,
//             Address: address.address[0].address,
//             Pincode: address.address[0].pincode,
//             City: address.address[0].city,
//             State: address.address[0].state,
//             Mobile: address.address[0].mobile,
//         };

//         const currentDate = new Date().toLocaleString("en-US", {
//             timeZone: "Asia/Kolkata",
//         });

//         if (PaymentMethod === "COD") {
//             res.json({ codSuccess: true });

//         } else if (PaymentMethod === "wallet") {
//             await User.findByIdAndUpdate(userid, {
//                 $inc: { wallet: -totalAmount },
//             });

//             const walletTransactions = new walletTransaction({
//                 user: userid,
//                 amount: totalAmount,
//                 description: "Used For Purchase",
//                 transactionType: "debit",
//             });


            
//             await walletTransactions.save();


//             res.json({ wallet: true });

//         } else {
//             try {
//                 const order = {
//                     amount: totalAmount,
//                     currency: "INR",
//                     receipt: userid,
//                 };
//                 const createdOrder = await razorpay.createRazorpayOrder(order);

//                 console.log("payment response", createdOrder);



//                 res.json({ online: true, createdOrder, order });
//                 console.log('1111111111111111111111111');
//             } catch (err) {
//                 console.log("!@#$%^#%^$%@#!#$%^%^$%^$");
//                 console.log(err);
//                 return res.status(500).send(`Internal Server Error: ${err.message}`);
//             }
//         }
//         console.log('llllllllllllllllllldfffffffffffffffgggggggggggggggggggggggggggggg');
//         try {
//             console.log("dddddddddddddddddddddddddddddddddddddddddddddddddddddddddaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
//             const newOrders = new order({
//                 UserId: userid,
//                 Items: newItems,
//                 OrderDate: currentDate,
//                 ExpectedDeliveryDate: new Date(
//                     Date.now() + 4 * 24 * 60 * 60 * 1000
//                 ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
//                 TotalPrice: totalAmount,
//                 Address: add,
//                 PaymentMethod: PaymentMethod,
//             });

//             const orders = await newOrders.save();
//             console.log(
//                 orders,
//                 '**!!*!*!*!*!*!*!*!*!*!*!**!*!*!**!*!*'
//             );

//             for (const item of orders.Items) {
//                 const productId = item.productId;
//                 console.log(productId, '222222222222222222222222');

//                 const products = await product.findById(productId);
//                 console.log(products);
//                 if (products) {
//                     let size = item.size;
//                     console.log('======', size);

//                     let variants;
//                     for (const variant of products.variant) {
//                         if (variant.size === size) {
//                             variants = variant;
//                             break;
//                         }
//                     }

//                     if (variants) {
//                         console.log(variants);

//                         const updatedQuantity = variants.quantity - item.quantity;
//                         console.log(
//                             updatedQuantity,
//                             '!.!>1>!!>!.!>!>!>>!>!.!>>!.!.!>>`1.!.'
//                         );
//                         if (updatedQuantity < 0) {
//                             variants.quantity = 0;
//                             products.Status = "Out of Stock";
//                         } else {
//                             variants.quantity = updatedQuantity;
//                             await products.save();
//                         }
//                     }
//                 }
//             }

//             await cart.findByIdAndDelete(userCart._id);
//         } catch (error) {
//             console.error('error while confirming the order:', error);
//             return res.status(500).send(`Internal Server Error: ${error.message}`);
//         }
//     } catch (error) {
//         console.error('error in the outer try block:', error);
//         return res.status(500).send(`Internal Server Error: ${error.message}`);
//     }
// };



const verifyPayment = async (req, res) => {

    try {

        let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);

        hmac.update(
            req.body.payment.razorpay_order_id +
            "|" +
            req.body.payment.razorpay_payment_id
        );

        hmac = hmac.digest("hex");

        if (hmac === req.body.payment.razorpay_signature) {
            const orderId = new mongoose.Types.ObjectId(
                req.body.order.createdOrder.receipt
            );

            const updateOrderDocument = await order.findByIdAndUpdate(orderId, {
                PaymentStatus: "Paid",
                PaymentMethod: "Online",
            });

            console.log(updateOrderDocument, 'llllllll');




            res.json({ success: true });
        } else {

            res.json({ failure: true });
        }
    } catch (error) {
        console.error("failed to verify the payment", error);
    }
};




const successOrder = async (req, res) => {
    try {
        res.render('./user/ordersuccess')
    } catch (error) {
        console.error('error while rendering the order success page:', error)
    }
}





const OrderList = async (req, res) => {
    try {
        const Orderdata = await order.find().populate('Items.productId UserId ReturnRequest').sort({ OrderDate: 'desc' });;

        res.render('./admin/orderList', { Orderdata });
    } catch (error) {
        console.error('MongoDB Error:', error);
        res.status(500).send('Internal Server Error');
    }
};







const orderHistory = async (req, res) => {
    try {
        const email = req.session.email;


        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).send('User not found');
        }
        const orders = await order.find({ UserId: user._id }).sort({ OrderDate: -1 }).populate('Items.productId');

        if (!orders) {
            return res.status(404).send('Orders not found');
        }

        res.render('./user/order', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};




const updateOrderStatus = async (req, res) => {
    try {

        const orderId = req.body.orderId;
        const newStatus = req.body.status;

        const existingOrder = await order.findById(orderId).populate('Items.productId');

        if (!existingOrder) {
            return res.json({ success: false, error: 'Order not found' });
        }

        if (newStatus === 'rejected' && existingOrder.Status !== 'rejected') {

            for (const item of existingOrder.Items) {
                const productId = item.productId;
                const size = item.size;
                const quantity = item.quantity;

                const products = await product.findById(productId);

                if (products) {
                    const variant = products.variant.find(v => v.size === size);

                    if (variant) {

                        variant.quantity += quantity;
                        await products.save();
                    }
                }
            }
        }
        console.log("@##$$%$%%");

        await order.findByIdAndUpdate(orderId, {
            Status: newStatus,
            PaymentStatus: "Pending",
        });

        if (newStatus === "delivered") {
            const deliveryDate = new Date();
            await order.findByIdAndUpdate(orderId, {
                Status: newStatus,
                PaymentStatus: "Paid",
                DeliveryDate: deliveryDate,
            });

        }



        res.json({ success: true });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.json({ success: false, error: 'Internal Server Error' });
    }
};




const Cancelorderstatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const newStatus = 'cancelled';

        const existingOrder = await order.findById(orderId).populate('Items.productId');

        if (!existingOrder) {
            return res.json({ success: false, error: 'Order not found' });
        }

        if (existingOrder.Status === 'cancelled') {
            return res.json({ success: false, error: 'Order is already cancelled' });
        }

        for (const item of existingOrder.Items) {
            const productId = item.productId;
            const size = item.size;
            const quantity = item.quantity;

            const products = await product.findById(productId);

            if (products) {
                const variant = products.variant.find(v => v.size === size);

                if (variant) {
                    variant.quantity += quantity;
                    await products.save();
                }
            }
        }



        if (existingOrder.PaymentMethod === "Online" || existingOrder.PaymentMethod === "Wallet") {
            const userId = existingOrder.UserId;
            const refundAmount = existingOrder.TotalPrice;
    
            await User.findByIdAndUpdate(userId, {
              $inc: { wallet: refundAmount },
            });
    
            const walletTransactions = new walletTransaction({
              user: userId,
              amount: refundAmount,
              description: "Refund for canceled order",
              transactionType: "credit",
            });
    
            await walletTransactions.save();
            
          }
    
          existingOrder.Status = "Cancelled";
          await existingOrder.save();


        
        await order.findByIdAndUpdate(orderId, {
            Status: newStatus,
            PaymentStatus: 'Cancelled',
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.json({ success: false, error: 'Internal Server Error' });
    }
};



const acceptReturn=async(req,res)=>{
    try {
      const orderId = req.params.orderId; 
  

      const existingOrder = await order.findById(orderId).populate('Items.productId');

      if (!existingOrder) {
          return res.json({ success: false, error: 'Order not found' });
      }


      for (const item of existingOrder.Items) {
          const productId = item.productId;
          const size = item.size;
          const quantity = item.quantity;

          const products = await product.findById(productId);

          if (products) {
              const variant = products.variant.find(v => v.size === size);

              if (variant) {
                  variant.quantity += quantity;
                  await products.save();
              }
          }
      }
      

      const updatedOrder = await order.findByIdAndUpdate(
        orderId,
        { $set: { Status: 'Return Accepted' } },
        { new: true }
      );
      const userId = updatedOrder.UserId;
      const refundAmount = updatedOrder.TotalPrice;
  
      await User.findByIdAndUpdate(userId, { $inc: { wallet: refundAmount } });
  
      const walletTransactions = new walletTransaction({
        user: userId,
        amount: refundAmount,
        description: 'Product returned',
        transactionType: 'credit',
      });
      
      await walletTransactions.save();
  
      res.json({ success: true, order: updatedOrder });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  
  
  //cancel return
  const cancelReturn=async(req,res)=>{
    try {
      const orderId = req.params.orderId;
  
      const updatedOrder = await order.findByIdAndUpdate(
        orderId,
        { $set: { Status: 'Return Rejected ' } },
        { new: true }
      );
      res.json({ success: true, order: updatedOrder });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  






  const genereatesalesReport = async (req, res) => {
    console.log('AAAAAAAAAAAAAAAADDDDDDDDDDDDDDDDIIIIIIIIIILLLLLLLLL');
    try {
     
        const format = req.body.downloadFormat;
        const startDate = isValid(parseISO(req.body.startDate)) ? parseISO(req.body.startDate) : null;
        const endDate = isValid(parseISO(req.body.endDate)) ? parseISO(req.body.endDate) : null;
      endDate.setHours(23, 59, 59, 999);
  
      const orders = await order.find({
        PaymentStatus: "Paid",
        OrderDate: {
          $gte: startDate,
          $lte: endDate,
        },
      }).populate('Items.productId').populate({
        path: "UserId",
        select: "username", 
      })
      console.log(orders,'cheking the datas');
      
  
      let totalSales = 0;
  
      orders.forEach((order) => {
        totalSales += order.TotalPrice || 0;
      });
      
  
      pdf.downloadReport(
        req,
        res,
        orders,
        startDate,
        endDate,
        totalSales.toFixed(2),
        format
      );
      
    } catch (error) {
      console.log("Error while generating sales report pdf:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  







module.exports = {

    checkoutpage,
    orderSuccess,
    successOrder,
    OrderList,
    orderHistory,
    updateOrderStatus,
    Cancelorderstatus,
    verifyPayment,
    cancelReturn,
    acceptReturn,
    genereatesalesReport


}