import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/config.js"
import userRouter from "./routers/userRouter.js"

dotenv.config()
const app = express()
app.use(express.json())
app.use(userRouter)

const port = process.env.port
connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`server on port: ${port}`)
    })
}).catch((error)=>{
    console.log(error.message)
})