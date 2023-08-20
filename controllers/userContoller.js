const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const isIdValid = require('./utils/utils')

//@desc Get all users
//@route GET /users
//@access private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})

//@desc Create new user
//@route POST /users
//@access private
const createNewUser = asyncHandler (async (req, res) => {
    const { username, password, roles} = req.body
    
    //All data required
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'})
    }
    
    //Check for duplicate
    const duplicate = await User.findOne({username}).lean().exec()
    if (duplicate){
        return res.status(409).json({message: 'Duplicate username'})
    }

    //Setting the user to create
    const hashedPwd = await bcrypt.hash(password, 10)
    const userObject = { username, 'password': hashedPwd, roles}

    //Creating the user
    const user = await User.create(userObject)
    if (user) {
        res.status(201).json({message: `New user ${username} created`})
    } else {
        res.status(400).json({message: 'Invalid user data received'})
    }

})

//@desc Update a users
//@route PUT /users
//@access private
const updateUser = asyncHandler (async (req, res) => {
    const { id, username, roles, active, password } = req.body

    //All data required
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: 'All fields are required'})
    }

    //Finding the user
    if (!isIdValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({message: 'User not found'})
    }

    //Checking for duplicate
    const duplicate = await User.findOne({username}).lean().exec()
    //Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message: 'Duplicate username bobo'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        //Hash password
        user.password = await bcrypt.hash(password, 10)
    }

    const updateUser = await user.save()
    res.json({message: `${updateUser.username} updated`})
})

//@desc Delete a user 
//@route DELETE /users
//@access private
const deleteUser = asyncHandler (async (req, res) => {
    const {id} = req.body
    
    //Id required
    if(!id) {
        return res.status(400).json({message: 'Id required'})
    }

    //Checking the format of the id
    if (!isIdValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    //Can't delete a user with notes
    const note = await Note.findOne({user: id}).lean().exec()
    if (note) {
        return res.status(400).json({message: 'User has asigned notes baka'})
    }

    //Finding the user
    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({message: 'User not found'})
    }

    const result = await user.deleteOne()
    const reply = `Username ${result.username} with ID ${result.id} se murió :(`
    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}