const router = require("express").Router();
const {
  getAllStudentsOfBatch,
  getAllStudents,
  getAllSubjectsOfStudent,
} = require("../controllers/studentController");
const { updateStudentsOfBatch } = require("../controllers/batchController");

// authentication Handler
const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticationHandler, authorizeUser("admin"), getAllStudents);

router.route("/subjects").get(authenticationHandler, getAllSubjectsOfStudent);

router
  .route("/:id")
  .patch(
    authenticationHandler,
    authorizeUser("teacher", "admin"),
    updateStudentsOfBatch
  )
  .get(
    authenticationHandler,
    authorizeUser("admin", "teacher"),
    getAllStudentsOfBatch
  );

module.exports = router;
