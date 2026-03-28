import { PhotoFile } from "@/types";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_DIMENSION = 1920;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Image must be smaller than 5 MB.";
  }
  return null;
}

export async function fileToPhotoFile(file: File): Promise<PhotoFile> {
  const base64 = await resizeAndEncode(file);
  return {
    id: uuidv4(),
    base64,
    mimeType: file.type as PhotoFile["mimeType"],
    originalName: file.name,
  };
}

async function resizeAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL(file.type, 0.9));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

// Strip the data URI prefix for API calls
export function stripDataUri(base64: string): string {
  return base64.replace(/^data:[^;]+;base64,/, "");
}

// Compress a base64 image to max 800px / 0.7 quality for API calls
// Keeps the display version untouched, reduces each photo to ~100-200KB
export async function compressForApi(base64: string, mimeType: string): Promise<string> {
  const API_MAX_DIM = 800;
  const API_QUALITY = 0.7;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > API_MAX_DIM || height > API_MAX_DIM) {
        if (width > height) {
          height = Math.round((height * API_MAX_DIM) / width);
          width = API_MAX_DIM;
        } else {
          width = Math.round((width * API_MAX_DIM) / height);
          height = API_MAX_DIM;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      // Always output as JPEG for consistent compression
      resolve(canvas.toDataURL("image/jpeg", API_QUALITY));
    };
    img.onerror = () => reject(new Error("Failed to compress image"));
    img.src = base64;
  });
}
