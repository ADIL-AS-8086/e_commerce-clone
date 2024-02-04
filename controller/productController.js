const products = require('../model/prodectSchema');
const Category = require('../model/categorySchema');
require('dotenv').config()

const path=require('path')
const sharp = require('sharp');



const productsPage = async (req, res) => {
  try {
    
    const productData = await products.find({ isDeleted: false }).populate('categoryId');;

        
    res.render('./admin/products', { productData ,errorMessage:null});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const addproduct = async (req, res) => {
  try {
    
    
    const categories = await Category.find({ isDeleted: false });

    
    res.render('./admin/addproduct', { categories , errorMessage:null});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const toaddProduct = async (req, res) => {
  try {
  
    const { productname, colour, brand, price, category, sizes, Spec1, Spec2, Spec3, Spec4 } = req.body;

   
   const productNameLower = productname.toLowerCase();

  
   const existingProduct = await products.findOne({
     isDeleted: false ,
     name: { $regex: new RegExp('^' + productNameLower + '$', 'i') },
   });
      const categories = await Category.find({ isDeleted: false });

   if (existingProduct) {
    
    return res.status(400).render('./admin/addproduct', { errorMessage: 'Product with a similar name already exists.' ,categories });
  }
  

    
    const imageFields = ['productImages', 'image1', 'image2', 'image3', 'image4'];
    const images = [];

    for (const field of imageFields) {
      if (req.files[field]) {
        images.push({  filename: req.files[field][0].filename });
      }
    }


    let Obj = []
    for (let i = 0; i < req.body.variant.size.length; i++) {
        Obj.push({
            size: req.body.variant.size[i],
            quantity: req.body.variant.quantity[i]
        })
    }





      console.log(images);
  
    const newProduct = await products.create({
      name: productname,
      colour: colour, 
      brand: brand,
      price: price,
      variant:Obj,
      categoryId: category,
      images: images,
      highlight1:Spec1,
      highlight2:Spec2,
      highlight3:Spec3,
      highlight4:Spec4,
      

      


    
    });
    
    console.log(newProduct);

    console.log('Product added successfully',newProduct);

    
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




const   editproduct = async (req, res) => {
  const id = req.params.id
  const productData = await products.findOne({ _id: id })
  const variant = productData.variant
  const categories = await Category.find({ isDeleted: false })


  const selectedCategory = await Category.findById(productData.categoryId);
  res.render('./admin/editproduct', { productData, categories, variant,selectedCategory })

}



const updateProduct = async (req, res) => {
  try {
    // console.log(JSON.stringify(req.body), 'Body of request_______________________________--');
    const id = req.params.id;
    const productDetails = req.body;
    // console.log("product detailssssssssssssssssssssssssssssssssssssssssssssssssssssssssss", productDetails);
    console.log('Files:', req.files,'------------------------------------------------------->');
// console.log('Fields:', Object.keys(req.body));


    let Obj = [];
    // console.log(req.body.variant, 'Variants _____________');
    for (let i = 0; i < req.body.variant.size.length; i++) {
      Obj.push({
        size: req.body.variant.size[i],
        quantity: req.body.variant.quantity[i],
      });
    }

    // console.log("ggggggggggggggggggggggggggggggggggggggggggggggggggggggggg", Obj);
    const productData = await products.findById(id);

    if (!productData) {
      // console.log("Product not found");
      return res.status(404).send("Product not found");
    }

    const updateData = {
      name: req.body.productname,
      highlight1: req.body.Spec1,
      highlight2: req.body.Spec2,
      highlight3: req.body.Spec3,
      highlight4: req.body.Spec4,
      price: req.body.price,
      brand: req.body.brand,
      colour: req.body.colour,
      category: req.body.category,
      variant: Obj,
      images: [...productData.images],
    };


    // const uploadedFiles = req.files;

    // for (let i = 1; i <= 4; i++) {
    //   const imageName = `image${i}`;
    //   if (uploadedFiles && uploadedFiles[imageName]) {
      
    //     updateData.images[i - 1] = { filename: uploadedFiles[imageName][0].filename };
    //   } else if (!updateData.images[i - 1]) {
       
    //     updateData.images[i - 1] = productData.images[i - 1] || null;
    //   }
    // }
    const images = [];
    const exisitngProduct = await products.findById(id);
      if (exisitngProduct) {
        images.push(...exisitngProduct.images);
      }
      const len = exisitngProduct.images.length;
      console.log(len);
      for (i = 0; i < len; i++) {
        if (req.files[i]) {
          let temp = req.files[i]?.fieldname.split('');
          images[temp[5]] = {filename:req.files[i]?.filename};
        }
      }
      // req.body.image = images;

      const productDatas = req.body;
      
      const uploaded = await products.updateOne(
        { _id: id },
        {
           $set: updateData ,
          images :  images,
        }
      );

      const productDataFin = await products.findById(id);
      console.log(id,'=======id');
      console.log(productDataFin,'productDataFin___________');
      console.log(images,'images__________________');
      console.log(uploaded);

    
    // console.log('Updated Images:', updateData.images);

    
    // const updatedProduct = await products.findByIdAndUpdate(id, updateData, { new: true });

    if (productDataFin) {
      console.log("Product Updated");
      res.redirect('/admin/products');
    } else {
      console.log("Failed to update product");
      res.status(500).send("Failed to update product");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};







const blockproducts = async (req, res) => {
  try {
    console.log('--------------------------');
    const id = req.params.id;
    console.log(',,,,,,,,,,,',id);
    const productData=await products.findById(id)
    console.log(productData);
    const newStatus = !productData.Status;
    await products.updateOne(
        { _id: id },
        { $set: { Status: newStatus } }
    );
    console.log('............................................',newStatus);
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const checkStock = async (req, res) => {
  try {
      const productsToCheck = JSON.parse(req.body.products);

      for (const productInfo of productsToCheck) {
          const product = await products.findById(productInfo.productId);
          
          if (!product) {
              return res.json({ success: false, error: "Product not found." });
          }

          const variant = product.variant.find(v => v.size === productInfo.size);

          if (!variant) {
              return res.json({ success: false, error: "Variant not found for the product." });
          }

          if (variant.quantity < productInfo.quantity) {
              return res.json({ success: false, error: `Not enough stock available for product ${product.name}` });
          }
      }

      res.json({ success: true });
  } catch (error) {
      console.error('Error while checking stock:', error);
      res.json({ success: false, error: 'Internal server error' });
  }
};


const softDeleteProduct = async (req, res) => {
  const productId = req.params.id;
  console.log(req.params,';;;;;;;;;;;;;');


  try {
    console.log(productId,'....................');
    const product = await products.findById(productId);
    console.log(product,'12563uihabhhhfhjksbdafk;jber8tgaedsa fiq34ytgifuaewbto87734tguiwvbe8134tuij');

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const result = await products.findByIdAndUpdate(
      productId,
      { isDeleted: true },
      { new: true }
    );

    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const offerpage= async(req,res)=>{
  try {
    const productData= await products.find( { isDeleted: false })
      console.log(productData,'AAAAAAAAAAAFFFFFFFFFFFFFFFFFFSSSSSSSSSSSSSSSSSAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLL');
res.render('./admin/offerse',{productData})
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


const addoffer = async (req, res) => {
  try {
    const productId = req.params.id;
    const { discountPercentage, startDate, endDate } = req.body;

    const product = await products.findById(productId);

    if (!product) {
      return res.json({ success: false, error: 'Product not found' });
    }

    const discountedPrice = Math.round(product.price - (product.price * discountPercentage / 100));

    product.offer = {
      discountPercentage,
      startDate,
      endDate,
    };

    product.Discountedprice = discountedPrice;

    await product.save();

    res.json({ success: true, message: 'Offer added successfully' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: 'Internal Server Error' });
  }
};


const deleteoffer=async(req,res)=>{
  try {
    const productId = req.params.id;

    const product = await products.findById(productId);

    if (!product || !product.offer) {
        return res.json({ success: false, error: 'Offer not found for the product' });
    }

    // Remove the offer details
    product.offer = undefined;
    product.Discountedprice = undefined;

    await product.save();


    res.status(200)

res.redirect('/admin/offer-list')
} catch (error) {
    console.error(error);
    res.json({ success: false, error: 'Internal Server Error' });
}
};











module.exports = {
  productsPage,
  addproduct,
  toaddProduct,
  editproduct,
  updateProduct,
  blockproducts,
  checkStock,
  softDeleteProduct,
  offerpage,
  addoffer,
  deleteoffer,
  
  
};
