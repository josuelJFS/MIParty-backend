const express = require('express');
const router = express.Router();
const {querySync}  = require("../mysql");


const {createToken,altenticarToken} = require('../token/token');


router.get('/',altenticarToken,async(req,res)=>{
  res.send({status:true})
})






module.exports = router;