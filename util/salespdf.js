const fs = require('fs');
const exceljs = require('exceljs');
const dateFns = require('date-fns');
const PDFDocument = require('pdfkit');
const ejs = require('ejs');

module.exports = {
  downloadReport: async (req, res, orders, startDate, endDate, totalSales, format) => {
    const formattedStartDate = dateFns.format(new Date(startDate), 'yyyy-MM-dd');
    const formattedEndDate = dateFns.format(new Date(endDate), 'yyyy-MM-dd');

    try {
      const totalAmount = parseInt(totalSales);

      if (format === 'pdf') {
        const pdfOptions = {
          path: `/home/ubuntu/e_commerce-clone//public//SRpdf//sales-report-${formattedStartDate}-${formattedEndDate}.pdf`,
        };

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(pdfOptions.path);
        doc.pipe(stream);

        // Add your PDF structure here based on your requirements
        doc.fontSize(18).text(`Sales Report From ${startDate.toLocaleDateString('en-GB')} to ${endDate.toLocaleDateString('en-GB')}`, { align: 'center' });

        // Add table headers
        doc.moveDown();
        doc.font('Helvetica-Bold');
        generateTableRow(doc, 100, 'No', 'Order ID', 'Order Date', 'Payment Method', 'Amount');
        doc.font('Helvetica'); // Reset font

        // Add table rows
        let i = 0;
        let sum = 0;
        orders.forEach(order => {
          doc.moveDown();
          generateTableRow(doc, 100 + (i + 1) * 15, i + 1, order._id, order.OrderDate.toLocaleDateString('en-GB') + order.OrderDate.toLocaleTimeString(), order.PaymentMethod, order.TotalPrice || 0);
          i++;
        });

        // Add total sales
        doc.moveDown().text(`Total Sales: ${totalAmount.toFixed(2)}`, { align: 'right'});


        doc.end();

        stream.on('finish', () => {
          res.status(200).download(pdfOptions.path);
        });

      } else if (format === 'excel') {
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
          { header: 'SL No', key: 'slno', width: 10 },
          { header: 'Order ID', key: 'orderId', width: 25 },
          { header: 'Order Date', key: 'orderDate', width: 25 },
          { header: 'Payment Method', key: 'paymentMethod', width: 25 },
          { header: 'Amount', key: 'amount', width: 20 },
          { header: 'Grand Total', key: 'total', width: 20 },
        ];

        let totalSalesAmount = 0;

        orders.forEach((order, index) => {
          worksheet.addRow({
            slno: index + 1,
            orderId: order._id,
            orderDate: order.OrderDate ? new Date(order.OrderDate).toLocaleDateString('en-US') : '',
            paymentMethod: order.PaymentMethod,
            amount: (order.TotalPrice || 0).toFixed(2),  
            
          });

          // totalSalesAmount += order.TotalPrice;
        });

        worksheet.addRow({ slno: '', orderId: '', orderDate: '', paymentMethod: '', amount: '',total: (totalAmount || 0).toFixed(2) });

        const excelFilePath = `/home/ubuntu/e_commerce-clone//public//SRexcel//sales-report-${formattedStartDate}-${formattedEndDate}.xlsx`;
        await workbook.xlsx.writeFile(excelFilePath);

        res.status(200).download(excelFilePath);

      } else {
        res.status(400).send('Invalid download format');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).send('Internal Server Error');
    }
  },
};

function generateTableRow(doc, y, slno, orderId, orderDate, paymentMethod, amount) {
  doc
    .fontSize(7)
    .text(slno.toString(), 50, y)
    .text(orderId, 100, y)
    .text(orderDate, 200, y)
    .text(paymentMethod, 350, y) 
    .text(parseFloat(amount).toFixed(2), 408, y, { align: 'right' })  
    .moveTo(50, y + 15)
    .lineTo(560, y + 15)
    .lineWidth(0.5)
    .strokeColor('#ccc')
    .stroke();
}