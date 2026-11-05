module.exports=(req,res)=>{res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,service:'carrom-x',ts:Date.now()})};
