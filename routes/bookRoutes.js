const router = require("express").Router();

// authentication Handler
const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");

const {
  createBook,
  getAllBooks,
  getBookByID,
  updateBook,
  deleteBook,
  getAllAvailableBooks,
} = require("../controllers/bookController");

router
  .route("/createBook")
  .post(authenticationHandler, authorizeUser("librarian", "admin"), createBook);
router.route("/getAllBooks").get(authenticationHandler, getAllBooks);
router
  .route("/getAllAvailableBooks")
  .get(authenticationHandler, getAllAvailableBooks);
router
  .route("/:id")
  .get(authenticationHandler, authorizeUser("librarian", "admin"), getBookByID)
  .patch(authenticationHandler, authorizeUser("librarian", "admin"), updateBook)
  .delete(
    authenticationHandler,
    authorizeUser("librarian", "admin"),
    deleteBook
  );

module.exports = router;
