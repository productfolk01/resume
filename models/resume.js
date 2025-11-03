import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: String,
  resumeFile: String, // file path
  photo: String, // file path
});

export default mongoose.model("Resume", ResumeSchema);
