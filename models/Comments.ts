import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  blogId: string;
  userName: string;
  userEmail: string;
  content: string;
  date: string;
}

const CommentSchema = new Schema<IComment>({
  blogId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
