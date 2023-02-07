const router = require("express").Router();

// authentication Handler
const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");
const {
  getAllTeachers,
  getAllBatchesOfTeacher,
} = require("../controllers/teacherController");

router
  .route("/")
  .get(authenticationHandler, authorizeUser("admin"), getAllTeachers);

router
  .route("/batches")
  .get(
    authenticationHandler,
    authorizeUser("teacher", "admin"),
    getAllBatchesOfTeacher
  );

module.exports = router;
