const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Book = require("../models/BookSchema");
const Borrow = require("../models/Borrowbook");
const moment = require("moment-timezone");

// Create Borrowing Records ------------->>>>>>>>>>> Teacher(ADMIN)
const createBorrowingRecord = async (req, res) => {
  let { studentId, bookId, issueDate, returned, submitDate, dueDate } =
    req.body;
  const { userId: issuedBy } = req.user;

  if (!studentId || !bookId) {
    throw new CustomAPIError.BadRequestError(
      "Please provide student and book ID"
    );
  }

  const student = await User.findOne({ _id: studentId });
  if (!student) {
    return res
      .status(404)
      .json({ message: `Student with Id : ${studentId} does not exist.` });
  }

  // Check if the book is availble
  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    return res
      .status(404)
      .json({ message: `Book with Id : ${bookId} does not exist.` });
  }
  if (book.quantity <= 0) {
    return res.status(400).json({ message: "Book is out of Stock." });
  }

  if (!issueDate) {
    issueDate = moment()
      .tz(process.env.TIME_ZONE)
      .startOf("day")
      .format("YYYY-MM-DD");
  }

  if (!dueDate) {
    const newDate = moment(issueDate)
      .add(process.env.RETURN_TIME, "days")
      .format("YYYY-MM-DD");
    dueDate = newDate;
  }

  const newBorrow = await Borrow.create({
    studentId,
    bookId,
    issueDate,
    returned,
    submitDate,
    dueDate,
    issuedBy,
  });
  book.quantity--;
  await book.save();
  await User.findOneAndUpdate(
    { _id: studentId },
    { $push: { books: newBorrow._id } },
    {
      new: true,
      runValidators: true,
    }
  );
  res
    .status(StatusCodes.CREATED)
    .json({ message: "Book Borrowed successfully.", borrow: newBorrow });
};

// get All Borrow Record ----------------->>>>>>>>>>>>>>>> For Use Teacher
const getAllBorrowRecord = async (req, res) => {
  try {
    const borrowings = await Borrow.find();
    res
      .status(StatusCodes.OK)
      .json({ message: "Book Fatched successfully.", borrowings });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching borrowing records." });
  }
};
// Return  Book -------------------->>>>>>>>>>>> For use Teacher
const returnBook = async (req, res) => {
  const { id } = req.params;
  let { submitDate } = req.body;
  const { userId: submitedBy } = req.user;
  const borrow = await Borrow.findOne({ _id: id });
  if (!borrow) {
    throw new CustomAPIError.NotFoundError(
      `Borrow record with ID : ${id} doesn't exists.`
    );
  }

  // Increment book quantity
  const book = await Book.findOne({ _id: borrow.bookId });
  book.quantity++;
  await book.save();
  if (!submitDate) {
    submitDate = moment()
      .tz(process.env.TIME_ZONE)
      .startOf("day")
      .format("YYYY-MM-DD");
  }

  const differenceInDays = moment(submitDate).diff(
    moment(borrow.dueDate),
    "days"
  );
  const charges = Math.max(0, differenceInDays * process.env.CHARGES_PER_DAY);

  const updatedBorrowing = await Borrow.findOneAndUpdate(
    { _id: id },
    { returned: true, submitDate, submitedBy },
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({
    message: "Book Returned successfully.",
    borrow: updatedBorrowing,
    charges,
  });
};

const getStudentBookHistory = async (req, res) => {
  const { email } = req.body;

  const student = await User.findOne({ email }).populate({
    path: "books",
    populate: {
      path: "bookId",
      model: "Book",
    },
  });

  if (!student) {
    throw new CustomAPIError.NotFoundError(
      `Student with given Email : ${email} doesn't exist`
    );
  }

  res.status(200).json({ books: student.books });
};

module.exports = {
  createBorrowingRecord,
  getAllBorrowRecord,
  returnBook,
  getStudentBookHistory,
};
