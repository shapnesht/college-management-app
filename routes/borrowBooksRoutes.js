const router = require("express").Router();

// authentication Handler
const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");

const {
  createBorrowingRecord,
  getAllBorrowRecord,
  getStudentBookHistory,
  returnBook,
} = require("../controllers/borrowBook");

router
  .route("/createBorrowBook")
  .post(authenticationHandler, authorizeUser("librarian", "admin"), createBorrowingRecord);
router
  .route("/getBorrowBook")
  .get(authenticationHandler, authorizeUser("admin", "librarian"), getAllBorrowRecord);
router
  .route("/getStudentBookHistory")
  .get(authenticationHandler, getStudentBookHistory);
router
  .route("/returnBorrowBook/:id")
  .patch(authenticationHandler, authorizeUser("admin", "librarian"), returnBook);

module.exports = router;
