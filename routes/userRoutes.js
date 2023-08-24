const express = require('express')
const router = express.Router()
const usersController = require('../controllers/userContoller')
const verifyJWT = require('../middleware/verifyJWT')

//middleware
router.use(verifyJWT)

router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = router