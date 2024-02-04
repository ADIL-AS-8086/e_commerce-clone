const verifyAdmin=(req,res,next)=>{
    if(req.session.adminlogged){
        next()
    }else{
        res.redirect('/'); 
    }
}


const adminExist=(req,res,next)=>{
    if(req.session.adminlogged){
        res.redirect('/admin/products')
    }else{
     next()
    }
}


module.exports={
    verifyAdmin,
    adminExist
}