const jwt=require("jsonwebtoken")
const conn = require("../db/conn")
const auth=async(req,res,next)=>{

    try{
        const idToken=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(idToken,process.env.SECRET_KEY)
        req.id=decoded.id
        sql="SELECT * from users where user_id= ?"
        conn.query(sql,decoded.id,(err,result)=>{
            if(err){
              return res.status(400).send({
                msg:err})
            }
        return next();
        })
    }catch(error){
          res.status(401).send({error: "NOT Authorized to this user"})
    }
}

module.exports=auth