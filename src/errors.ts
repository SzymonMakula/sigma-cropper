export class CropperError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, CropperError.prototype);
    this.name = "SigmaCropper Error";
  }
}
