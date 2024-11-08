import { CropperError } from "./errors";

export async function getScaledBitmap(src: string) {
  const cropperMinSize = getCropperMinSize();

  const targetBlob = await fetch(src).then((res) => res.blob());
  const originalBitmap = await createImageBitmap(targetBlob);
  const isLandscapeOrientation = originalBitmap.width > originalBitmap.height;

  const scaledBitmap = await createImageBitmap(originalBitmap, {
    resizeWidth: !isLandscapeOrientation ? cropperMinSize : undefined,
    resizeHeight: isLandscapeOrientation ? cropperMinSize : undefined,
    resizeQuality: "high",
  });
  originalBitmap.close();

  return scaledBitmap;
}

export async function bitmapToObjectURL(bitmap: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("bitmaprenderer")!;
  ctx.transferFromImageBitmap(bitmap);
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res));
  if (!blob)
    throw new CropperError(
      "Sigma Cropper: Could not write ImageBitmap to file",
    );

  return URL.createObjectURL(blob);
}

const CROPPER_MIN_SIZE_CSS_VAR = "--cropper-min-w";

export function getCropperMinSize() {
  const [dimension] = getCropperMinSizeInPixels().split("px");
  return Number(dimension);
}

function getCropperMinSizeInPixels() {
  return getComputedStyle(document.body).getPropertyValue(
    CROPPER_MIN_SIZE_CSS_VAR,
  );
}
