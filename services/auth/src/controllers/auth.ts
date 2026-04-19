import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";
import { publishEvent } from "../config/email.publish.js";

// export const loginUser = TryCatch(async (req, res) => {
//   const { code } = req.body;
//   if (!code) {
//     return res.status(400).json({
//       message: "Authorization code is required",
//     });
//   }
//   const googleRes = await oauth2client.getToken(code);
//   oauth2client.setCredentials(googleRes.tokens);
//   const userRes = await axios.get(
//     `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`,
//   );

//   const { email, name, picture } = userRes.data;
//   let user = await User.findOne({ email });
//   if (!user) {
//     user = await User.create({
//       name,
//       email,
//       image: picture,
//     });
//   }
//   const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
//     expiresIn: "15d",
//   });
//   res.status(200).json({
//     message: "Logged Sucess",
//     token,
//     user,
//   });
// });
export const googleLogin = TryCatch(async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Authorization code is required",
      });
    }

    // //console.log("Received code:", code);

    const googleRes = await oauth2client.getToken(code);
    // //console.log("Google tokens:", googleRes.tokens);

    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );

    // //console.log("User data:", userRes.data);

    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        image: picture,
      });
    }

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
      expiresIn: "15d",
    });

    res.status(200).json({
      message: "Logged Success",
      token,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if(user.role === "rider" || user.role === "seller"){
    const admins = await User.find({role:"admin"});

    const adminEmails = admins.map(admin => admin.email);
    publishEvent(user,adminEmails);
  }else{
    publishEvent(user);
  }
  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  }); 
  return res.json({
    user,
    token,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  return res.json(user);
});
