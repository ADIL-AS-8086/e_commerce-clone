const ejs = require('ejs');
const express = require('express');
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const nocache = require('nocache');
const passport = require('passport');
const mongoose = require('mongoose');
const path=require('path')
const morgan=require('morgan')
const { v4: uuidv4 } = require('uuid');
const app = express();
const multer = require("multer");
const port = process.env.PORT;
const host=process.env.HOST
connectDB=require('./config/connectionDB')
// const FileType = require('file-type');
const { validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const sharp = require('sharp');




app.use(express.static('public'));
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(nocache());
app.use(morgan('tiny'));

app.use(bodyParser.json());


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
//
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })      
  );
  
  app.use(flash());


  
const userRouter=require("./routes/userRoutes")
const adminRouter=require("./routes/adminRoutes");









app.use('/',userRouter)
app.use('/admin', adminRouter);










// Start the server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

