const express = require('express');
const admin = express.Router();
const adminController = require('../controller/adminController');
const catogeryController = require('../controller/catogeryController');
const upload = require('../middleware/multer');
const editmulter = require('../middleware/edilMulter');
const productController = require('../controller/productController');
const uploadproduct = require('../middleware/productmulter');
const orderController=require('../controller/ordercontroller')
const couponController=require('../controller/couponController')
const adminAuth=require('../middleware/adminAuth')
const referralController=require('../controller/refferalController')

// <<--------------------------------------------------------------------------------------------------------------------------->>
// <<--------------------------------------------------------------------------------------------------------------------------->>



admin.get('/dashboard',adminAuth.verifyAdmin, adminController.isAdmin)
admin.get('/count-orders-by-day',adminAuth.verifyAdmin, adminController.getCount)
admin.get('/count-orders-by-month',adminAuth.verifyAdmin, adminController.getCount)
admin.get('/count-orders-by-year',adminAuth.verifyAdmin, adminController.getCount)
admin.get('/latestOrders',adminAuth.verifyAdmin, adminController.getOrdersAndSellers)









// <<--------------------------------------------------------------------------------------------------------------------------->>
// user mangement

admin.get('/', adminAuth.adminExist,adminController.login);
admin.get('/users',adminAuth.verifyAdmin,adminController.userpage);
admin.post('/adminLogin',adminAuth.adminExist,adminController.loginPost)



admin.post('/block/:userId',adminAuth.verifyAdmin,adminController.blockUser)
admin.post('/unblock/:userId',adminAuth.verifyAdmin,adminController.unBlockUser)

// <<--------------------------------------------------------------------------------------------------------------------------->>
// catogerymanagent


admin.get('/catogeryList',adminAuth.verifyAdmin, catogeryController.categoryListPage);
admin.get('/addCategory',adminAuth.verifyAdmin, catogeryController.addCategorypage);
admin.post('/toaddCatogery',upload.single('image'),adminAuth.verifyAdmin, catogeryController.addCategory);

admin.get('/editcategory/:id',adminAuth.verifyAdmin, catogeryController.editCategory);
admin.post('/editcategory/:id', editmulter.single('image'),adminAuth.verifyAdmin, catogeryController.afterEditCategory);

admin.post('/blockCategory/:id', adminAuth.verifyAdmin, catogeryController.blockcatogery);




admin.post('/deleteCategory/:id',adminAuth.verifyAdmin, catogeryController.deleteCategory);

// <<--------------------------------------------------------------------------------------------------------------------------->>












// <<--------------------------------------------------------------------------------------------------------------------------->>
// <<--------------------------------------------------------------------------------------------------------------------------->>
// products managment
admin.get('/products' ,adminAuth.verifyAdmin, productController.productsPage);
admin.get('/addproduct' ,adminAuth.verifyAdmin, productController.addproduct);

admin.post('/addproduct', uploadproduct.fields([
  { name: 'productImages', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]),adminAuth.verifyAdmin, productController.toaddProduct);



//editproduct
admin.get('/editProduct/:id' ,adminAuth.verifyAdmin, productController.editproduct);

// admin.post('/editproduct/:id', uploadproduct.fields([
//   { name: 'productImages', maxCount: 1 },
//   { name: 'image1', maxCount: 1 },
//   { name: 'image2', maxCount: 1 },
//   { name: 'image3', maxCount: 1 },
//   { name: 'image4', maxCount: 1 },
// ]), productController.updateProduct);

admin.post('/editproduct/:id',adminAuth.verifyAdmin,uploadproduct.any(),productController.updateProduct)



admin.get('/blockproduct/:id',adminAuth.verifyAdmin, productController.blockproducts);

admin.post('/delete-product/:id' ,adminAuth.verifyAdmin, productController.softDeleteProduct);
// <<--------------------------------------------------------------------------------------------------------------------------->>


admin.get('/offer-list',adminAuth.verifyAdmin,productController.offerpage)
admin.post('/add-offer/:id',adminAuth.verifyAdmin, productController.addoffer)

admin.post('/delete-offer/:id',adminAuth.verifyAdmin, productController.deleteoffer);
// <<--------------------------------------------------------------------------------------------------------------------------->>





// orderadmin

admin.get('/order-list',adminAuth.verifyAdmin, orderController.OrderList);

admin.post('/updateOrderStatus',adminAuth.verifyAdmin,orderController.updateOrderStatus);


admin.put('/orders/acceptReturn/:orderId',adminAuth.verifyAdmin,orderController.acceptReturn)
admin.put('/orders/cancelReturn/:orderId',adminAuth.verifyAdmin,orderController.cancelReturn)



//coupons

admin.get('/coupon-page',adminAuth.verifyAdmin,couponController.couponPage)
admin.post('/add-coupon',adminAuth.verifyAdmin, couponController.addCoupon);
admin.post('/delete-coupon/:id',adminAuth.verifyAdmin,couponController.deletecoupon)



//refferal 

admin.get('/refferal',adminAuth.verifyAdmin,referralController.refferalWallet)
admin.post('/updateReferralAmount',adminAuth.verifyAdmin, referralController.updateReferralAmount)

admin.post('/download-sales-report',adminAuth.verifyAdmin, orderController.genereatesalesReport)



module.exports = admin;
