const Note = require("../models/Note");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const isIdValid = require("./utils/utils");

//@desc Get all notes
//@route GET /notes
//@access private
const getAllNotes = asyncHandler(async (req, res) => {
  let notes;

  //Getting just the notes of a user
  const { user } = req.body;
  if (user) {
    //Valid user id format
    if (!isIdValid(user)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    notes = await Note.find({ user: user }).lean();
    if (!notes?.length) {
      return res.status(400).json({ message: "No notes found for the user" });
    }
    return res.json(notes);
  }

  //Getting all the notes with username
  notes = await Note.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $addFields: {
        username: { $arrayElemAt: ["$userInfo.username", 0] },
        completedValue: { $cond: ["$completed", 1, 0] },
      },
    },
    {
      $sort: {
        completedValue: 1,
      },
    },
    {
      $project: {
        userInfo: 0,
        completedValue: 0,
      },
    },
  ]);

  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found in general" });
  }

  res.json(notes);
});

//@desc Create a note
//@route POST /notes
//@access private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text, completed } = req.body;

  //Checking all fields
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields required" });
  }

  //Correct user id format
  if (!isIdValid(user)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  //Setting the note
  const noteObject = {
    user,
    title,
    text,
    ...(completed !== undefined && { completed }),
  };

  //Creating the note
  const note = await Note.create(noteObject);
  if (note) {
    res
      .status(201)
      .json({ message: `New note ${title} of the user ${user} created prro` });
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
});

//@desc Update a note
//@route PATCH /notes
//@access private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  //Checking all fields
  if (!id || !user || !title || !text || !completed) {
    return res.status(400).json({ message: "All fields required" });
  }

  //Correct ID formats
  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid note ID format" });
  }
  if (!isIdValid(user)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  //Finding the note
  const note = await Note.findById(id).lean().exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found que" });
  }

  //Cheking for duplicate note's title
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate && duplicate?._id !== id) {
    return res.status(409).json({ message: `Note's title duplicate` });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updateNote = await note.save();
  res.json({ message: `${updateNote.title} updated` });
});

//@desc Delete a note
//@route DELETE /notes
//@access private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  //Id required
  if (!id) {
    return res.status(400).json({ message: "Id required" });
  }

  //Checking the format of the id
  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid note ID format" });
  }

  //Finding the user
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();
  const reply = `Note ${result.title} with ID ${result.id} se murió :v`;
  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
