import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  blogId: string;
  userName: string;
  userEmail: string;
  content: string;
  date: string;
}
