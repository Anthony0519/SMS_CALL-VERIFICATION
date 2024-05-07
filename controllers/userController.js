import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
// import {Vonage} from "@vonage/server-sdk"
import twilio from "twilio"
const key = process.env.VONAGE_KEY
const secret = process.env.VONAGE_SECRET
const brand = process.env.BRAND_NAME

export const signUp = async (req, res) =>{
    try{
        const {
            fullname,
            email,
            phoneNumber,
            password,
            confirmPassword
    } = req.body
        const userExists = await userModel.findOne({email})

        if(userExists){
            return res.status(400).json({
                message: `User with email: ${userExists.email} already exists`
            })
        }
          
        if(password != confirmPassword){
            return res.status(400).json({
                message: `Password does not match`
            })
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        const user = await userModel.create({
            fullname,
            email:email.toLowerCase(),
            phoneNumber,
            walletId:phoneNumber.slice(1),
            password: hash,
        })
        res.status(201).json({
            message: `Welcome, ${user.fullname}. You have created an account successfully`,
            data: user
        })

    }catch(err){
        res.status(500).json({
            message: err.message 
        })
    }

}

//Create a login function for the user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the provided detail is an email or phone number
        const user = await userModel.findOne({email});

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        // Check if the provided password is correct
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid password',
            });
        }

        // Create and sign a JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
            process.env.JWT_KEY,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: `Welcome onboard, ${user.fullname}. You have successfully logged in`,
            data: user,
            token,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
}

export const getOne = async (req, res) =>{
    try{
        const userId = req.user.userId

        const user = await userModel.findById(userId)

        if(!user){
            return res.status(404).json({
                message: `User not found`
            })
        }
        res.status(200).json({
            message: `User fetched successfully`,
            data: {
                name:user.fullname,
                email: user.email,
                wallet: user.walletId,
                Ballance:user.acctBalance
            }
        })

    }catch(err){
        res.status(500).json({
            message: err.message,
        })
    }
}

// VERIFY PHONE NUMBER BY SMS OR CALL USING TWILIO API
export const sendOTP = async(req,res)=>{
    try {

        // get the user's phone number
        const {phoneNumber,type} = req.body

        // get twilio sid and token
        const twilio_sid = process.env.SID
        const twilio_auth = process.env.AUTH_TOKEN

        // configure twilio
        const client = twilio(twilio_sid,twilio_auth)

        // construct twilio to send otp
       const response = client.verify.v2.services("VAd7d974d984907055327d780cd823fe5a").verifications
        .create({to: `${phoneNumber}`, channel: `${type}`})
        .then(verification => {return verification.status})

        res.status(200).json({
            message:"successfully sent OTP to your mobile number",
            status:response
        })
        
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

export const verifyOTP = async(req,res)=>{
    try{

        // get the otp
        const {phoneNumber,OTP} = req.body

        // get twilio sid and token
        const twilio_sid = process.env.SID
        const twilio_auth = process.env.AUTH_TOKEN

        // configure twilio
        const client = twilio(twilio_sid,twilio_auth)

        // verify the otp
        const verify = client.verify.v2.services("VAd7d974d984907055327d780cd823fe5a")
        .verificationChecks
        .create({to: `${phoneNumber}`, code: `${OTP}`})
        .then(verification_check => {return verification_check.status})     
        
        res.status(200).json({
            message:"successfully verified OTP",
            status:verify
        })

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}

// VERIFY PHONE NUMBER BY SMS USING VONAGE API
// export const sendOTP = async(req,res)=>{
//     try {

//         // get the phoneNumber
//         const {phoneNumber} = req.body
//         if(!phoneNumber){
//             return res.status(400).json({
//                 error:"please enter phone number"
//             })
//         }

//         const vonage = new Vonage(({
//             apiKey:key,
//             apiSecret:secret
//           }))

//        const response = await vonage.verify.start({
//             number:phoneNumber,
//             brand:brand
//         })
//         console.log(response)

//         const requestId = response.request_id
//         console.log(requestId)

//         if(!requestId){
//             return res.status(400).json({
//                 error:"error sending otp"
//             })
//         }

//         res.status(200).json({
//             message:"successfully sent OTP",
//             data:requestId
//         })
        
//     } catch (error) {
//         res.status(500).json({
//             error:error.message
//         })
//     }
// }

// export const verifyOTP = async(req,res)=>{
//     try{

//         // get verification details
//         const {OTP,requestId} = req.body
//         if(!OTP){
//             return res.status(400).json({
//                 error:"pleanse enter code"
//             })
//         }

//         const vonage = new Vonage(({
//             apiKey:key,
//             apiSecret:secret
//         }))

//         vonage.verify.check(requestId,OTP)
//         .then(status => console.log(status))
//         .catch(error => console.log(error))

//         res.status(200).json({
//             message:"verified"
//         })

//     }catch(error){
//         res.status(500).json({
//             error:error.message
//         })
//     }
// }