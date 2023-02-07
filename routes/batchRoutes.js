const router = require("express").Router();
const {
  createBatch,
  updateBatch,
  deleteBatch,
  getBatch,
  getAllBatches,
  updateStudentsOfBatch,
} = require("../controllers/batchController");

// authentication Handler
const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");

router
  .route("/")
  .post(authenticationHandler, authorizeUser("teacher", "admin"), createBatch)
  .get(authenticationHandler, getAllBatches);

router
  .route("/students/:id")
  .patch(
    authenticationHandler,
    authorizeUser("teacher", "admin"),
    updateStudentsOfBatch
  );

router
  .route("/:id")
  .get(authenticationHandler, getBatch)
  .patch(authenticationHandler, updateBatch)
  .delete(authenticationHandler, deleteBatch);

module.exports = router;
