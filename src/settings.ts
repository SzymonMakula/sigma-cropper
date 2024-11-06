type FileFormatMetadata = {
  extension: string;
  mimeType: string;
};

export type CropperSettings = {
  qualitySetting: number;
  fileFormatMetadata: FileFormatMetadata;
};

export const DEFAULT_SETTINGS: CropperSettings = {
  qualitySetting: 0.7,
  fileFormatMetadata: {
    extension: "jpeg",
    mimeType: "image/jpeg",
  },
};

export function getFileFormatMetadata(fileFormat: string): FileFormatMetadata {
  switch (fileFormat) {
    case "jpeg":
      return {
        extension: "jpeg",
        mimeType: "image/jpeg",
      };
    case "png":
      return {
        extension: "png",
        mimeType: "image/png",
      };

    case "webp":
      return {
        extension: "webp",
        mimeType: "image/webp",
      };
    default:
      throw new Error("Sigma-Cropper: Unrecognized image format");
  }
}
