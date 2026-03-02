const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'orders.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function readOrders(){
  try{ return JSON.parse(fs.readFileSync(DB, 'utf8') || '[]'); }
  catch(e){ return []; }
}
function writeOrders(data){
  fs.writeFileSync(DB, JSON.stringify(data, null, 2), 'utf8');
}

// simple menu data
const MENU = [
  {id:1,name:'Meat Pie',price:150,image:'https://picsum.photos/seed/meatpie/400/300'},
  {id:2,name:'Samosa',price:50,image:'https://picsum.photos/seed/samosa/400/300'},
  {id:3,name:'Spring Roll',price:70,image:'https://picsum.photos/seed/springroll/400/300'},
  {id:4,name:'Milky Donut',price:120,image:'https://picsum.photos/seed/donut/400/300'},
  {id:5,name:'Fried Rice & Pepper Chicken',price:900,image:'https://picsum.photos/seed/friedrice/400/300'},
  {id:6,name:'Brown Spaghetti & Meatballs',price:950,image:'https://picsum.photos/seed/spaghetti/400/300'}
];

app.get('/api/menu', (req,res)=>{ res.json(MENU); });

app.get('/api/orders', (req,res)=>{ res.json(readOrders()); });

app.post('/api/orders', (req,res)=>{
  const orders = readOrders();
  const order = req.body;
  if(!order || !order.customer) return res.status(400).json({error:'invalid order'});
  order.id = 'ORD-'+Date.now();
  order.created = new Date().toISOString();
  orders.push(order);
  writeOrders(orders);
  res.status(201).json(order);
});

app.listen(PORT, ()=>console.log(`Food-mobile server running on http://localhost:${PORT}`));
