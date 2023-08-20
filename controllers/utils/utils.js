const { Types } = require('mongoose')

//Checking the format of the ID
const isIdValid  = (id) => Types.ObjectId.isValid(id) ? true : false


module.exports = isIdValid

