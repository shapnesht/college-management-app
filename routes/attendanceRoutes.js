const router = require("express").Router();

const {
  createAttendance,
  getAllAttendanceByDate,
  updateAttendance,
  getAttendance,
  deleteAttendance,
  getAttendanceByDateAndTime,
} = require("../controllers/attendanceController");

const {
  authenticationHandler,
  authorizeUser,
} = require("../middleware/authentication");

router
  .route("/")
  .post(
    authenticationHandler,
    authorizeUser("admin", "teacher"),
    createAttendance
  )
  .get(
    authenticationHandler,
    authorizeUser("admin"),
    getAttendance
  );

router
  .route("/getAttendanceByDateAndTime")
  .get(
    authenticationHandler,
    authorizeUser("admin", "teacher"),
    getAttendanceByDateAndTime
  )

router
  .route("/getAttendanceByDate")
  .get(
    authenticationHandler,
    authorizeUser("admin", "teacher"),
    getAllAttendanceByDate
  )

router
  .route("/:id")
  .patch(
    authenticationHandler,
    authorizeUser("admin", "teacher"),
    updateAttendance
  )
  .get(authenticationHandler, authorizeUser("admin", "teacher"), getAttendance)
  .delete(
    authenticationHandler,
    authorizeUser("admin", "teacher"),
    deleteAttendance
  );

module.exports = router;
