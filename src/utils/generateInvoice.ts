export const generateInvoice = (order:any) => {

const invoiceWindow = window.open("", "_blank");

if(!invoiceWindow) return;

const itemsHtml = order.items.map((item:any)=>`
<tr>
<td>${item.name}</td>
<td>${item.qty}</td>
<td>₹${item.price}</td>
</tr>
`).join("");

invoiceWindow.document.write(`
<html>
<head>

<title>Invoice</title>

<style>

body{
font-family:Arial;
padding:40px;
}

.header{
display:flex;
justify-content:space-between;
}

.logo{
font-size:28px;
font-weight:bold;
}

.table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

.table th,.table td{
border:1px solid #ddd;
padding:10px;
text-align:left;
}

.total{
font-size:18px;
margin-top:20px;
font-weight:bold;
}

</style>

</head>

<body>

<div class="header">

<div>
<div class="logo">YOUTUPIA</div>
<p>GST: 22AAAAA0000A1Z5</p>
<p>India</p>
</div>

<div>
<h2>Invoice</h2>
<p>Order ID: ${order.id}</p>
<p>Date: ${new Date(order.date).toLocaleDateString()}</p>
</div>

</div>

<table class="table">

<tr>
<th>Item</th>
<th>Qty</th>
<th>Price</th>
</tr>

${itemsHtml}

</table>

<div class="total">
Total: ₹${order.total}
</div>

<script>
window.print()
</script>

</body>

</html>
`);

invoiceWindow.document.close();

};
