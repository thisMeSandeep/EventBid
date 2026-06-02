import { v2 as cloudinary } from "cloudinary";
import { env } from "../../lib/env";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import type { StorageAdapter, UploadResult } from "./storage.adapter.interface";

type CloudinaryResourceType = "image" | "video" | "raw";

const EXTENSION_PATTERN = /\.[^/.]+$/;

// Root folder all EventBid assets live under in Cloudinary. Keeping it as a
// prefix on the public_id (rather than only the stored key) means uploads nest
// correctly in both fixed-folder and dynamic-folder accounts.
const ROOT_FOLDER = "event_bid";

function resourceTypeFromContentType(contentType: string): CloudinaryResourceType {
  if (contentType.startsWith("image/")) {
    return "image";
  }

  if (contentType.startsWith("video/") || contentType.startsWith("audio/")) {
    return "video";
  }

  return "raw";
}

function publicIdFromKey(key: string, resourceType: CloudinaryResourceType): string {
  const withoutExt = resourceType === "raw" ? key : key.replace(EXTENSION_PATTERN, "");
  return `${ROOT_FOLDER}/${withoutExt}`;
}

// The Cloudinary folder an asset belongs to: the public_id minus its last segment.
function assetFolderFromPublicId(publicId: string): string {
  return publicId.split("/").slice(0, -1).join("/");
}

export class CloudinaryStorageAdapter implements StorageAdapter {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const resourceType = resourceTypeFromContentType(contentType);
    const publicId = publicIdFromKey(key, resourceType);

    const response = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          asset_folder: assetFolderFromPublicId(publicId),
          resource_type: resourceType,
          overwrite: true,
        },
        (
          error?: UploadApiErrorResponse,
          result?: UploadApiResponse,
        ): void => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload completed without a result"));
            return;
          }

          resolve(result);
        },
      );

      uploadStream.end(buffer);
    });

    return { publicUrl: response.secure_url };
  }

  async deleteObject(key: string): Promise<void> {
    const publicIds = new Set([
      publicIdFromKey(key, "image"),
      publicIdFromKey(key, "video"),
      publicIdFromKey(key, "raw"),
    ]);

    await Promise.all(
      [...publicIds].flatMap((publicId) =>
        (["image", "video", "raw"] as const).map((resourceType) =>
          cloudinary.uploader.destroy(publicId, { resource_type: resourceType }),
        ),
      ),
    );
  }
}

export const storage = new CloudinaryStorageAdapter();
