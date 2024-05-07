import {Router} from 'express'
// const router = express.Router();
import { signUp, login, sendOTP, verifyOTP, getOne } from '../controllers/userController.js'
import authorization from '../middleware/authorization.js'
// import validation from '../validation/validation.js'
// const upload = require('../utils/multer');

const router = Router()

router.post('/signup', signUp)

router.post('/login', login)

router.post('/send-otp', sendOTP)

router.post('/verify-otp', verifyOTP)

router.get('/getone', authorization, getOne)

export default router;   