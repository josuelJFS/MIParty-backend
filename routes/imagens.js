const express = require('express');
const router = express.Router();
const {createToken,altenticarToken} = require('../token/token');
const {queryCliente} = require('../sql/mysqlClientes');
var nodeBase64 = require('nodejs-base64-converter');

router.get('/',altenticarToken,(req,res)=>{
    const {CodigoAluno} = req.query;
    const {site} = req.token;
    if(!CodigoAluno) return res.json({error:'parametro GET CodigoAluno não definido'})
    queryCliente(site,
        `select * from  TblAlunoImg where IdImgAluno = ?`,
        [CodigoAluno]).then(result=>{
            res.setHeader('Content-Type','image/jpeg');
    
            if(result.length > 0){
                res.send(result[0].Foto)
            }else{
                res.json(
                    {
                        resultado:result,
                        status:false,
                        error:'CodigoAluno incorreto!'
                    }
                );
            }
        
        }).catch(error=>{res.send(error)})
})




module.exports = router;