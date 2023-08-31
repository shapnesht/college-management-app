const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const Book = require("../models/BookSchema");

// create a Book ---->>>> Library-Teacher
const createBook = async (req, res) => {
  const { title, author, isbn, quantity } = req.body;

  if (!title || !author || !isbn) {
    throw new CustomAPIError.BadRequestError(
      "Please provide title, author and isbn"
    );
  }
  const book = await Book.findOne({ isbn });
  if (book) {
    throw new CustomAPIError.BadRequestError(
      `Book with ISBN : ${isbn} already exists with ID : ${book._id}`
    );
  }

  const newBook = await Book.create({ title, author, isbn, quantity });
  res
    .status(StatusCodes.CREATED)
    .json({ message: "Book created successfully.", book: newBook });
};

// Get All Book ---->>>>> teacher, student
const getAllBooks = async (req, res) => {
  const books = await Book.find({});
  if (!books) {
    throw new CustomAPIError.BadRequestError("Books Not found.");
  }
  res
    .status(StatusCodes.OK)
    .json({ message: "Books fetched successfully.", books });
};

const getAllAvailableBooks = async (req, res) => {
  const books = await Book.aggregate([
    {
      $match: {
        quantity: { $gt: 0 },
      },
    },
  ]);

  if (!books) {
    throw new CustomAPIError.NotFoundError("No Books Found");
  }
  res
    .status(StatusCodes.OK)
    .json({ message: "Books fetched successfully.", books });
};

// Get Book By Id ------>>>> User, Librarian
const getBookByID = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findOne({ _id: id });
  if (!book) {
    throw new CustomAPIError.NotFoundError("Book Not found.");
  }
  res
    .status(StatusCodes.OK)
    .json({ message: "Book fetched successfully.", book });
};

//Update Book
const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, quantity } = req.body;

  const book = await Book.findOne({ _id: id });
  if (!book) {
    throw new CustomAPIError.NotFoundError("Book Not found.");
  }
  console.log(isbn);
  const existingBook = await Book.findOne({ isbn });

  if (existingBook && existingBook._id.toString() !== id) {
    throw new CustomAPIError.BadRequestError(
      `Book with ISBN : ${isbn} already exists with is ID : ${existingBook._id}.`
    );
  }

  const updatedBook = await Book.findOneAndUpdate(
    { _id: id },
    { title, author, isbn, quantity },
    { new: true }
  );

  res.json({ message: "Book updated successfully.", book: updatedBook });
};

//Delete Book
const deleteBook = async (req, res) => {
  const { id } = req.params;

  const book = await Book.findOne({ _id: id });
  if (!book) {
    throw new CustomAPIError.NotFoundError("Book Not found.");
  }
  await Book.deleteOne({ _id: id });
  res.json({ message: "Book deleted successfully." });
};

module.exports = {
  createBook,
  getAllBooks,
  getBookByID,
  updateBook,
  deleteBook,
  getAllAvailableBooks,
};
