const { format } = require("util");
const express = require("express");
const Multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const sharp = require("sharp");
require("dotenv").config();
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const { Storage } = require("@google-cloud/storage");
// Instantiate a storage client
const storage = new Storage({
  
});
const app = express();
// app.set("view engine", "pug");
app.use(bodyParser.json());
var multerStorage = Multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmp/uploads");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: multerStorage,
  limits: {
    fileSize: 4096 * 1024 * 1024, // no larger than 4gb, you can change as needed.
  },
});
// A bucket is a container for objects (files).
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
// Display a form for uploading files.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/form.html"));
});
// Process the file upload and upload to Google Cloud Storage.
app.post("/upload", multer.single("file"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }
  // Create a new blob in the bucket and upload the file data.
  console.log(req.file.filename);
  try {
    sharp("./tmp/uploads/" + req.file.filename)
      .resize(320, 240)
      .toFile("./tmp/uploads/min-" + req.file.filename, (err, info) => {
        err ? console.error(err) : "";
        console.log(info);
        uploadImage(req.file.filename).then(() => {
          res.send(req.file.filename);
        });
      });
  } catch (e) {
    console.log("can't upload", e);
    res.send("error", e);
    return;
  }
});

async function uploadImage(filename) {
  const blob = await bucket.upload("./tmp/uploads/min-" + filename).then(() => {
    console.log("success");
  });
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});