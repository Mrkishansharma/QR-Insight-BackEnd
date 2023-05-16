

const express=require("express");

const { UserModel } = require("../Models/user.model");

require("dotenv").config()

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const { middleware } = require("../Middlewares/auth.middleware");


const profileRouter = express.Router()



profileRouter.patch('/updateProfile/:ID',middleware, async (req,res) =>{

    console.log(req.body);

    const { ID } = req.params;
    const userid = req.qr.id;
    const payload = req.body;

    console.log("foolchand --->",ID,userid)

    if(ID !== userid){
        return  res.status(400).send({error:"Unauthorizated Access. You Can't Update Profile Of Another User.", success:false});
    }

    try {
        await UserModel.findByIdAndUpdate({_id:ID}, payload);
        const user = await UserModel.findById({_id:ID});

        return res.status(200).send({
            success:true,
            user : user
        })

    } catch (error) {
        return res.status(500).send({
            success : false,
            error : error.message
        })
    }
})


profileRouter.delete('/deleteProfile/:ID',middleware, async (req,res) =>{
    const { ID } = req.params;
    const userid = req.qr.id;

    if(ID !== userid){
        return res.status(400).send({error:"Unauthorizated Access. You Can't Delete Profile Of Another User.", success:false});
    }

    try {
        const user = await UserModel.findById({_id:ID});

        if(user.Email == 'admin@qrinsight.com'){
            return res.status(400).send({error:"Unauthorizated Access. You Can't Able To Delete", success:false});
        }

        await UserModel.findByIdAndDelete({_id:ID});

        return res.status(200).send({
            success:true
        })

    } catch (error) {
        return res.status(500).send({
            success : false,
            error : error.message
        })
    }
})






module.exports = {
    profileRouter
}