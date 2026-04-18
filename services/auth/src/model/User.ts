import mongoose, { Document, Schema, CallbackWithoutResultAndOptionalError} from "mongoose";
import bcrypt from "bcrypt"; // Use bcryptjs to match your installed package

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  role: string;
  password?: string;
  authProvider: "google" | "local";
}

const schema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,  
    },
    password: {
      type: String,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ["google", "local"],
      default: "local",
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: null,  
    },
  },
  {
    timestamps: true,
  }
);
 
schema.pre("save", async function (this: IUser) { 
  if (!this.isModified("password") || !this.password) {
    return; 
  } 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model<IUser>("User", schema);
export default User;