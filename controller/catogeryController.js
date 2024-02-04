// const { log } = require('console')
const { log } = require('console')
const category = require('../model/categorySchema')
require('dotenv').config()


const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/tiff', 'image/avif'];


const categoryListPage = async (req, res) => {
    var i = 0
    const categoryData = await category.find({ isDeleted: false })
    res.render("./admin/CategoryList", { categoryData, i })
}



const    addCategorypage = (req, res) => {
    res.render('./admin/addCategory',{ alertMessage: req.query.alertMessage || '' })
}

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? req.file : undefined;


        if (image) {
            if (!supportedFormats.includes(image.mimetype)) {
               
                const alertMessage = encodeURIComponent('Unsupported image format');
                return res.redirect('/admin/addCategory?alertMessage=' + alertMessage);
            }
        } else {

        }

        const existingCategory = await category.findOne({
            categoryname: { $regex: new RegExp('^' + name + '$', 'i') }
        });

        if (existingCategory) {
     
            const alertMessage = encodeURIComponent('Category name already exists');
            return res.redirect('/admin/addCategory?alertMessage=' + alertMessage);
        }

   

        const newCategory = await category.create({
            categoryname: name,
            image: image ? image.filename : undefined
        });

        console.log("Category added:", newCategory);
        res.redirect('/admin/catogeryList');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};







const editCategory = async (req, res) => {
    const id = req.params.id;

    
    const categoryData = await category.findOne({ _id: id });

  
    const alertMessage = req.query.alertMessage || '';
    const imageFormatError = req.query.imageFormatError || ''; 

    res.render('./admin/editCategory', { categoryData, alertMessage, imageFormatError });
};





const afterEditCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;
        const newImage = req.file ? req.file : undefined;

      
        const existingCategory = await category.findOne({
            isDeleted: false ,
            categoryname: { $regex: new RegExp('^' + name + '$', 'i') },
            _id: { $ne: id },
            
        });

        if (existingCategory) {
            const alertMessage = encodeURIComponent('Category name already exists');
            return res.redirect('/admin/editCategory/' + id + '?alertMessage=' + alertMessage);
        }

        if (newImage) {
            const uploadedImage = newImage;

            if (!supportedFormats.includes(uploadedImage.mimetype)) {
                const alertMessage = encodeURIComponent('Unsupported image format ,provide valid image format   ');
                return res.redirect('/admin/editCategory/' + id + '?alertMessage=' + alertMessage);
            }

        }

        const updatedCategory = await category.findByIdAndUpdate(
            id,
            {
                $set: {
                    categoryname: name,
                    image: newImage ? newImage.filename : undefined
                }
            },
            { new: true }
        );

        console.log(updatedCategory);
        res.redirect('/admin/catogeryList');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        
        const updatedCategory = await category.findByIdAndUpdate(id, { isDeleted: true });

        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/catogeryList');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const blockcatogery = async (req, res) => {
    try {
        
      console.log('--------------------------');
      const id = req.params.id;
      console.log(',,,,,,,,,,,',id);
      const categoryData=await category.findById(id)
      console.log(categoryData);
      const newStatus = !categoryData.Status;
      await category.updateOne(
          { _id: id },
          { $set: { Status: newStatus } }
      );
      console.log('............................................',newStatus);
  
      res.redirect('/admin/catogeryList');
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  



module.exports = {
    addCategorypage,
    addCategory ,
    categoryListPage ,
    editCategory,
    afterEditCategory,
    deleteCategory,
    blockcatogery

     
    // editCategorypage
}