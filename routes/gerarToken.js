const express = require('express');
const router = express.Router();
const {querySync}  = require("../mysql");
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const jwt = require('jsonwebtoken');
const {createToken,altenticarToken} = require('../token/token');
var mysql = require('mysql');
const {queryCliente} = require('../sql/mysqlClientes');




router.get('/',(req,res)=>{
    var {site,admin} = req.query;
    if(!site) {return res.json({error:'informa site= esta vazio ou senha = '})}
    site = site.replace(/http:\/\/(.*)\//,'$1')
    site = '%'+site+'%';
   console.log(site)
   res.json(
            {
                token:createToken({site:site}),
                status:true
            }
    );
  
    
})




module.exports = router;