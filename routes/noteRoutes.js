const express = require('express')
const router = express.Router()
const notesController = require('../controllers/noteController')
const verifyJWT = require('../middleware/verifyJWT')

//middleware
router.use(verifyJWT)

router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNewNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)

module.exports = router