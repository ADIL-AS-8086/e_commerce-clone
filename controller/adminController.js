const { log } = require('console')
const mongoose = require('mongoose');
const order = require('../model/ordersShema')
const cart = require('../model/cartSchema')
const User = require('../model/userSchema')
const product = require('../model/prodectSchema')
const moment=require("moment")
const credentail={
    email:"admin@gmail.com",
    password:"123456789"
}

const adminpage = (req, res) => {
    res.render('./admin/adminHome');
};

const login= (req,res) =>{
res.render('./admin/adminlogin')
}

const loginPost=(req,res)=>{
    try {
        const{email,pass}=req.body
        console.log(email,pass,'.....................................');
        if(credentail.email==email && credentail.password==pass){
            req.session.adminlogged=true
            res.render('./admin/adminHome');
        }else{
            res.render('./admin/adminLogin',{error:'password or email wrong'})
        }
    } catch (error) {
        console.error(error)
    }
}


const userpage = async (req, res) => {
    try {
        const userData = await User.find().sort({ username: 1, email: 1, status: 1 });
        const totalUsersCount = userData.length;
        const activeUsersCount = userData.filter(user => user.status).length;
        const blockedUsersCount = totalUsersCount - activeUsersCount;

        res.render('./admin/users', {
            userData,
            totalUsersCount,
            activeUsersCount,
            blockedUsersCount
        });
    } catch (error) {
        console.error('Error while fetching user data:', error);

        res.status(500).send('Internal Server Error');
    }
};



const blockUser=async(req,res)=>{
    try {
        const userId=req.params.userId;
        const blockedUser = await User.findByIdAndUpdate(userId, { status: false }, { new: true });
        if (!blockedUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.redirect('/admin/users') 

    } catch (error) {
        console.error('error while block the user:',error)
    }
}
   

const unBlockUser=async(req,res)=>{
    try {
        const userId=req.params.userId;
        const unblockedUser = await User.findByIdAndUpdate(userId, { status: true }, { new: true });
        if (!unblockedUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.redirect('/admin/users') 
    } catch (error) {
        console.error('error while unblock the user:',error)
    }
}





const isAdmin = (req, res) => {
    res.render('admin/adminDash')
  }


  const getCount=async(req,res)=>{
    try {
      const orders = await order.find({
        Status: {
          $nin:["returned","Cancelled","Rejected"]
        }
      });
      console.log(orders,'OOOOOORRRRRRRRRRDDDDDDDDDDDDDEEEEEEEEEEEEEEERRRRRRRRSSSSSSSSSSSSSS');
  
      const orderCountsByDay = {};
      const totalAmountByDay = {};
      const orderCountsByMonthYear = {};
      const totalAmountByMonthYear = {};
      const orderCountsByYear = {};
      const totalAmountByYear = {};
      let labelsByCount;
      let labelsByAmount;
     console.log('aaaaaaaaaaarrrrrrrrrjjjjjjunnnnnnnnnnnnnnnnnnnnnnnnnnnnnrrrrrrrrrrrrrrrrrrrrrrrrrppppppppppppp');
      orders.forEach((orders) => {
  
        const orderDate = moment(orders.OrderDate, "M/D/YYYY, h:mm:ss A");
        const dayMonthYear = orderDate.format("YYYY-MM-DD");
        const monthYear = orderDate.format("YYYY-MM");
        const year = orderDate.format("YYYY");
        
        if (req.url === "/count-orders-by-day") {
         
          if (!orderCountsByDay[dayMonthYear]) {
            orderCountsByDay[dayMonthYear] = 1;
            totalAmountByDay[dayMonthYear] = orders.TotalPrice
           
          } else {
            orderCountsByDay[dayMonthYear]++;
            totalAmountByDay[dayMonthYear] += orders.TotalPrice
          }
          
          const ordersByDay = Object.keys(orderCountsByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              count: orderCountsByDay[dayMonthYear],
            })
          );
       
  
          const amountsByDay = Object.keys(totalAmountByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              total: totalAmountByDay[dayMonthYear],
            })
          );
  console.log(amountsByDay,'?????????????????????????????????????????????');
          
  
          amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
          ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
  
         
  
          labelsByCount = ordersByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
  
          labelsByAmount = amountsByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
  
          dataByCount = ordersByDay.map((entry) => entry.count);
          dataByAmount = amountsByDay.map((entry) => entry.total);
  
         
  
        } else if (req.url === "/count-orders-by-month") {
          if (!orderCountsByMonthYear[monthYear]) {
            orderCountsByMonthYear[monthYear] = 1;
            totalAmountByMonthYear[monthYear] = orders.TotalPrice;
          } else {
            orderCountsByMonthYear[monthYear]++;
            totalAmountByMonthYear[monthYear] += orders.TotalPrice;
          }
          console.log('ccccccccccccllllllllllllllllllllliiiiiiiiiiiiiiiiinnnnnnnnnnnnnnnntttttttttttttttttt');
        
          const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              count: orderCountsByMonthYear[monthYear],
            })
          );
          const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              total: totalAmountByMonthYear[monthYear],
            })
            
          );
          console.log('mmmmmmmmmmmmmmmmmaaaaaaaaaammmmmmmmmmmaaaaaaaaaathhhhhhhhh');
         
        
          ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          labelsByAmount = amountsByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          dataByCount = ordersByMonth.map((entry) => entry.count);
          dataByAmount = amountsByMonth.map((entry) => entry.total);
        } else if (req.url === "/count-orders-by-year") {
          if (!orderCountsByYear[year]) {
            orderCountsByYear[year] = 1;
            totalAmountByYear[year] = orders.TotalPrice;
          } else {
            orderCountsByYear[year]++;
            totalAmountByYear[year] += orders.TotalPrice;
          }
        console.log('pppppppppppppppaaaaaaaaaaaaaaarrrrrrrrrrrrrrrrrriiiiiiiiiiiiiiiiiiiii');
          const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
            _id: year,
            count: orderCountsByYear[year],
          }));
          const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
            _id: year,
            total: totalAmountByYear[year],
          }));
        
          ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByYear.map((entry) => entry._id);
          labelsByAmount = amountsByYear.map((entry) => entry._id);
          dataByCount = ordersByYear.map((entry) => entry.count);
          dataByAmount = amountsByYear.map((entry) => entry.total);
        }
      });
  
      console.log(labelsByCount,labelsByAmount,dataByCount,dataByAmount,'sssssssssssssssssaaaaaaaaaaaaaaaaaaaaannnnnnnnnnnnnnnnnnnnnnniiiiiiiiiiiii');
      res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
      
      
    } catch (error) {
      console.error("error while chart loading :",error)
    }
  }

  const getOrdersAndSellers=async(req,res)=>{
    try {
    
      const latestOrders = await order.find().sort({ _id: -1 }).limit(6);
    
    
      const bestSeller = await order.aggregate([
        {
          $unwind: "$Items",
        },
        {
          $group: {
            _id: "$Items.productId",
            totalCount: { $sum: "$Items.quantity" },
          },
        },
        {
          $sort: {
            totalCount: -1,
          },
        },
        {
          $limit: 6,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
      ]);
      
      if (!latestOrders || !bestSeller) throw new Error("No Data Found");
    
      res.json({ latestOrders, bestSeller });
    
    
     
    } catch (error) {
      console.log("error while fetching the order details in the dashboard",error);
    }
    }
    
    
    



module.exports = {
    adminpage,
    userpage,
    blockUser,
    unBlockUser,
    login,
    loginPost,
    isAdmin,
    getCount,
    getOrdersAndSellers
    // productsPage,
   // Add the new method

};
