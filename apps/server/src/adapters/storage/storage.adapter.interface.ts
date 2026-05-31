export interface UploadResult {
  publicUrl: string;
}

export interface StorageAdapter {
  upload(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<UploadResult>;
  deleteObject(key: string): Promise<void>;
}
