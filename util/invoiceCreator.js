const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');

console.log('aaaaannnnnnnnnnnnnnnnnnnnnaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');


module.exports = {
    generateInvoice: async (orderDetails) => {
        console.log("hello world$################################");
        console.log('again checking the utility files');
        console.log(orderDetails,';;;;;;nnnnooooottt geettting');
    

        try {
            var data = {
                
                "customize": {
                   
                },
    
                "images": {
                  
                    "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'specmenlog.png'), 'base64'),
                   
    
                },
                "sender": {
                    "company": "SPEC MEN",
                    "address": "ATHOLI",
                    "zip": "673001",
                    "city": "Calicut",
                    "country": "India"
                },
                "client": {
                    "company": orderDetails[0].Address.Name,
                    "address": orderDetails[0].Address.Address,
                    "zip":orderDetails[0].Address.Pincode ,
                    "city": orderDetails[0].Address.City,
                    "state": orderDetails[0].Address.State,
                    "phone": orderDetails[0].Address.Mobile.toString(),
                },
                "information": {
                    "Order ID": orderDetails[0]._id,
                    "date": orderDetails[0].OrderDate,
                    "invoice date": orderDetails[0].OrderDate,
                },
                "products": (orderDetails[0].Items && orderDetails[0].Items.length > 0) ? orderDetails[0].Items.map((product) => ({
                    "quantity": product.quantity,
                    "description": product.productId.name, 
                    "price": product.orderingprice
                })) : [],
                
    
                "bottom-notice": "Thank You For Your Purchase",
                "settings": {
                    "currency": "USD",
                    "tax-notation": "vat",
                    "currency": "INR",
                    "tax-notation": "GST",
                    "margin-top": 50,
                    "margin-right": 50,
                    "margin-left": 50,
                    "margin-bottom": 25
                },
    
          
        }

            const result = await easyinvoice.createInvoice(data);
            // console.log(result,'muhammed afsal is very dirty person');

            const filePath = path.join(__dirname, '..', 'public','pdf', `${orderDetails[0]._id}.pdf`);
            await fs.promises.writeFile(filePath, result.pdf, 'base64');

            return filePath;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};