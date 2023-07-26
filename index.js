const express = require('express');
const server = express();
const connectToMongo = require('./db');
connectToMongo();
const ProductsRouter = require("./routes/Product");
const categoryRouter = require("./routes/Category");
const brandsRouter = require("./routes/Brands");
const userRouter = require("./routes/User");
const authRouter = require("./routes/Auth");
const cartRouter = require("./routes/Cart");
const orderReducer = require("./routes/Order")

const cors = require('cors');

const port = process.env.PORT || 8080

//Middlewares
server.use(cors({
    exposedHeaders:['X-Total-Count']
}))
server.use(express.json()); //to parse req.body
server.use('/products',ProductsRouter.router)
server.use('/category',categoryRouter.router);
server.use('/brands',brandsRouter.router);
server.use('/users',userRouter.router);
server.use('/auth',authRouter.router);
server.use('/cart',cartRouter.router);
server.use('/orders',orderReducer.router);



server.get('/',(req,res)=>{
    res.json({status:'success'});
})



server.listen(port,()=>{
    console.log(`listnening at http://localhost:${port}`);
})