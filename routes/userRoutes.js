const router = require("express").Router();
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

// authentication Handler
const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticationHandler, authorizeUser("admin"), getAllUsers);

router.route("/showMe").get(authenticationHandler, showCurrentUser);
router.route("/updateUser").patch(authenticationHandler, updateUser);
router
  .route("/updateUserPassword")
  .patch(authenticationHandler, updateUserPassword);

router.route("/:id").get(authenticationHandler, getSingleUser);

module.exports = router;
