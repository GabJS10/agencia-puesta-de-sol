import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Sube un buffer de imagen a Cloudinary y devuelve la URL segura.
export function uploadImage(
  buffer: Buffer,
  folder = "puestadelsol",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload falló"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export { cloudinary };
