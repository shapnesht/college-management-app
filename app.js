require("dotenv").config();
require("express-async-errors");

// express
const express = require("express");
const app = express();

// database
const connectDB = require("./db/connect");

// error Handler middleware
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

// other packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// router
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const batchRoutes = require("./routes/batchRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/batch", batchRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teacher", teacherRoutes);

app.use(notFound);
app.use(errorHandler);
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
