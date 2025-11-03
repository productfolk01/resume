import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Resume from "./models/Resume.js";
import fs from "fs";

dotenv.config();

const app = express();

// ✅ Move CORS here, after app is defined
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// For ES modules path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Make sure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Hello from Resume Backend!");
});

// ✅ Resume upload API
app.post(
  "/api/resume",
  upload.fields([
    { name: "resumeFile", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, email, skills } = req.body;

      const resumeFile = req.files["resumeFile"]
        ? req.files["resumeFile"][0].path
        : null;
      const photo = req.files["photo"] ? req.files["photo"][0].path : null;

      const newResume = new Resume({
        name,
        email,
        skills,
        resumeFile,
        photo,
      });

      await newResume.save();
      console.log("✅ New resume saved:", newResume);

      res.status(200).json({ message: "Resume uploaded successfully!" });
    } catch (error) {
      console.error("❌ Error saving resume:", error);
      res.status(500).json({ message: "Server Error: " + error.message });
    }
  }
);

// Serve uploads
app.use("/uploads", express.static(uploadDir));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
