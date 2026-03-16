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
  {id:1,name:'Meat Pie',price:3000,image:'https://images.unsplash.com/photo-1608039783021-6116a558f0c5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:2,name:'Samosa',price:2500,image:'https://media.istockphoto.com/id/2183628082/photo/closeup-view-of-tasty-indian-street-food-samosa-snack-shop-in-arambol-goa-india.jpg?s=2048x2048&w=is&k=20&c=AuHS6N-nwYk4CuG6sgsGQ3sUgUJdn17EZN0b0TCsjvQ='},
  {id:3,name:'Spring Roll',price:1500,image:'https://images.unsplash.com/photo-1582454235987-1e597bafcf58?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:4,name:'Milky Donut',price:2000,image:'https://images.unsplash.com/photo-1612973019402-0a6ad60e93e6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:5,name:'Fried Rice & Pepper Chicken',price:4500,image:'https://images.unsplash.com/photo-1603496987674-79600a000f55?q=80&w=685&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:6,name:'Brown Spaghetti & Meatballs',price:3000,image:'https://images.unsplash.com/photo-1610657400673-7fc8941f403f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
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


