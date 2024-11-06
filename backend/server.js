const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfprobePath("C:\\ffmpeg\\bin\\ffprobe.exe");

const app = express();
const port = 5000;

mongoose.connect("mongodb://localhost:27017/video-upload");

const videoSchema = new mongoose.Schema({
  filename: String,
  duration: Number,
  resolution: String,
});

const Video = mongoose.model("Video", videoSchema);

// Setup multer for video file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Endpoint to upload video
app.post("/upload", upload.single("video"), (req, res) => {
  const filePath = req.file.path;

  // Extract video metadata using ffmpeg
  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error extracting metadata");
    }

    const videoMetadata = {
      filename: req.file.filename,
      duration: metadata.format.duration,
      resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
    };

    // Save metadata in MongoDB
    const newVideo = new Video(videoMetadata);
    newVideo
      .save()
      .then(() => res.json({ metadata: videoMetadata }))
      .catch((err) => res.status(500).send("Error saving metadata"));
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
