const { client } = require("../Config/redis");
const { blackmodel } = require("../Models/blackmodel");
const jwt = require("jsonwebtoken")
require("dotenv").config()



const middleware = async (req, res, next) => {
    try {
        let token = await client.get('token');
        let refreshtoken = await client.get('refreshtoken');


        // console.log(token, refreshtoken);
        if (token) {
            console.log('token hai');
        } else {
            console.log('token nhi hai');
        }
        if (refreshtoken) {
            console.log('refresh token hai');
        } else {
            console.log('refresh token nhi hai');
        }

        if (!token) {

            if (!refreshtoken) {

                return res.status(400).send({ "msg": "Please Login Again. AccessToken Not Found (Case : 0)", isValidToken: false });

            } else {
                try {
                    let decodRefreshToken = jwt.verify(refreshtoken, process.env.secretkey);

                    if (decodRefreshToken) {

                        let { id, verified, role } = decodRefreshToken

                        let token = jwt.sign({ id, verified, role }, process.env.secretkey, { expiresIn: "6hr" })
                        client.set('token', token, 'EX', 21600);

                        req.qr.id = id
                        req.qr.verified = verified
                        req.qr.role = role

                        next()


                    } else {

                        return res.status(400).send({ "msg": "Please Login First. (Case : 0) ", isValidToken: false });

                    }
                } catch (error) {

                    return res.status(400).send({ "msg": "Please Login First. (Case : 1)", isValidToken: false });

                }
            }

        } else {
            try {

                const istokenblacklist = await blackmodel.findOne({ token: token });
                const isrefreshtokenblacklisted = await blackmodel.findOne({ token: refreshtoken });


                if (istokenblacklist || isrefreshtokenblacklisted) {
                    return res.status(400).send({ msg: "Not Authorized. PLease Login Again (Case : 1)", isValidToken: false });
                }

                let decodedtoken = jwt.verify(token, process.env.secretkey);

                console.log('decodedtoken==>', decodedtoken);
                
                let decodedrefreshtoken = jwt.verify(refreshtoken, process.env.secretkey);
                
                console.log('decodedrefreshtoken==>', decodedrefreshtoken);

                if (!decodedtoken) {
                    if (!decodedrefreshtoken) {
                        return res.status(400).send({ msg: "Unauthorized Access. (Case : 2)", isValidToken: false });
                    } else {
                        let { id, verified, role } = decodedrefreshtoken

                        let token = jwt.sign({ id, verified, role }, process.env.secretkey, { expiresIn: "6hr" })
                        client.set('token', token, 'EX', 21600);

                        req.qr.id = id
                        req.qr.verified = verified
                        req.qr.role = role

                        next()

                    }

                } else {

                    let { id, verified, role } = decodedtoken
                    req.qr.id = id
                    req.qr.verified = verified
                    req.qr.role = role

                    next();
                }


            } catch (error) {
                return res.status(400).send({ "msg": "Please Login First. (Case : 4)",error:error.message ,isValidToken: false });
            }

        }


    } catch (error) {
        console.log(error)
        res.send({ msg: error.message, isValidToken: false })
    }


}

module.exports = {
    middleware
}