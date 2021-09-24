import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import StatusCodes from "http-status-codes";
import morgan from "morgan";
import path from "path";
import { predict } from "./brain/predict";
import { getAccuracy } from "./brain/score";
import { trainBrain } from "./brain/train";

const app = express();
const { BAD_REQUEST } = StatusCodes;

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

app.use(
  fileUpload({
    createParentPath: true,
  })
);

// // Add APIs
// app.use('/api', BaseRouter);

app.post("/trainBrain", (req, res) => {
  trainBrain();
});

app.get("/getBrainParam", async (req, res) => {
  const acc = await getAccuracy();
  res.send(acc);
});

app.post("/predict", (req, res) => {
  if (req.files?.image && !Array.isArray(req.files.image)) {
    res.send(predict(req.files.image.data));
  }
});

const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

// Export express instance
export default app;
