import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error("JWT_SECRET must be set to a random string of 32+ characters in production");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI must be set in production");
}

export const env = {
  isProd,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hirehub",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  geminiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "",
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME || "",
    key: process.env.CLOUDINARY_API_KEY || "",
    secret: process.env.CLOUDINARY_API_SECRET || "",
  },
};