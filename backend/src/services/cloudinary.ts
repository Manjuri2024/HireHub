import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

export const cloudinaryEnabled = () => !!(env.cloudinary.name && env.cloudinary.key && env.cloudinary.secret);

if (cloudinaryEnabled()) {
  cloudinary.config({ cloud_name: env.cloudinary.name, api_key: env.cloudinary.key, api_secret: env.cloudinary.secret });
}

export function uploadBuffer(buf: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hirehub/resumes", resource_type: "raw", public_id: `${Date.now()}-${filename.replace(/[^\w.-]/g, "_")}` },
      (err, result) => (err || !result ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buf);
  });
}
