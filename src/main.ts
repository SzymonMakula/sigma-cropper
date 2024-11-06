import {
  getOverflowTable,
  HorizontalOverflow,
  VerticalOverflow,
} from "./getOverflowTable";
import STYLES from "./styles.css";
import {
  CropperSettings,
  DEFAULT_SETTINGS,
  getFileFormatMetadata,
} from "./settings";
import { EventHandler, mouseHandlerFactory } from "./mouseEvents";
import { touchHandlerFactory } from "./touchEvents";
import {
  bitmapToObjectURL,
  getCropperMinSize,
  getScaledBitmap,
} from "./bitmap";
import { CropperError } from "./errors";

type ObservedAttribute = "src" | "quality" | "format";

export class Cropper extends HTMLElement {
  static observedAttributes: ObservedAttribute[] = ["src", "quality", "format"];

  mouseHandler: EventHandler = mouseHandlerFactory.call(this);
  touchHandler: EventHandler = touchHandlerFactory.call(this);
  private settings: CropperSettings = DEFAULT_SETTINGS;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const styles = document.createElement("style");
    styles.textContent = STYLES;
    shadow.appendChild(styles);

    const wrapper = document.createElement("div");
    wrapper.id = "wrapper";

    const slot = document.createElement("slot");
    slot.name = "selection";

    const draggable = document.createElement("img");
    draggable.id = "draggable";

    wrapper.appendChild(slot);
    wrapper.appendChild(draggable);
    shadow.appendChild(wrapper);
  }

  private _imageBitmap: ImageBitmap | null = null;

  get imageBitmap() {
    if (!this._imageBitmap)
      throw new CropperError(
        "ImageBitmap must be defined before calling this method",
      );
    return this._imageBitmap;
  }

  set imageBitmap(bitmap) {
    this._imageBitmap = bitmap;
  }

  get cropperMinSize() {
    return getCropperMinSize();
  }

  get draggableElement() {
    return this.shadow.querySelector("#draggable") as HTMLImageElement;
  }

  get draggableTransformMatrix(): DOMMatrix {
    return new DOMMatrix(this.draggableElement.style.transform);
  }

  get shadow(): ShadowRoot {
    const shadow = this.shadowRoot;
    if (!shadow) throw new CropperError("Should call with ShadowRoot attached");

    return shadow;
  }

  private get selectionElement() {
    const slotElement = this.shadow.querySelector("slot");
    if (!slotElement)
      throw new CropperError("Slot element should be defined in ShadowRoot");

    const [assignedElement] = slotElement.assignedElements();
    return assignedElement;
  }

  async attributeChangedCallback(
    key: ObservedAttribute,
    previousValue: string,
    newValue: string,
  ) {
    switch (key) {
      case "src": {
        this.imageBitmap = await getScaledBitmap(newValue);
        const bitmapCopy = await createImageBitmap(this.imageBitmap);
        this.draggableElement.width = bitmapCopy.width;
        this.draggableElement.height = bitmapCopy.height;
        this.draggableElement.style.transform = "none";
        this.draggableElement.src = await bitmapToObjectURL(bitmapCopy);
        break;
      }
      case "format": {
        this.settings = {
          ...this.settings,
          fileFormatMetadata: getFileFormatMetadata(newValue),
        };
        break;
      }
      case "quality": {
        this.settings = {
          ...this.settings,
          qualitySetting: Number(newValue),
        };
      }
    }
  }

  connectedCallback() {
    this.mouseHandler.registerHandler();
    this.touchHandler.registerHandler();
  }

  disconnectedCallback() {
    this.mouseHandler.removeHandler();
    this.touchHandler.removeHandler();
  }

  scaleImage(scale: number) {
    // Scale up image
    this.draggableElement.height = this.imageBitmap.height * scale;
    this.draggableElement.width = this.imageBitmap.width * scale;
    this.moveDraggable(0, 0);
  }

  async cropImage(): Promise<File> {
    // Create HTMLCanvasElement to draw on
    const canvas = document.createElement("canvas");
    canvas.width = this.cropperMinSize;
    canvas.height = this.cropperMinSize;
    // Get 2D context, provide white background of `selectionElement` sizing
    const canvasCtx = canvas.getContext("2d")!;
    canvasCtx.fillStyle = "white";
    canvasCtx.fillRect(0, 0, this.cropperMinSize, this.cropperMinSize);

    const scaledUpBitmap = await createImageBitmap(this.imageBitmap, {
      resizeWidth: this.draggableElement.width,
      resizeHeight: this.draggableElement.height,
      resizeQuality: "high",
    });

    const { e: currentTranslationX, f: currentTranslationY } =
      this.draggableTransformMatrix;

    // Draw a portion of draggable, with the same dimension as `selectionElement`, offset by a distance from draggable to selection in 2D coordinates
    canvasCtx.drawImage(
      scaledUpBitmap,
      Math.abs(currentTranslationX + this.draggableElement.offsetLeft),
      Math.abs(currentTranslationY + this.draggableElement.offsetTop),
      this.cropperMinSize,
      this.cropperMinSize,
      0,
      0,
      this.cropperMinSize,
      this.cropperMinSize,
    );

    return this.writeCanvasToFile(canvas);
  }

  moveDraggable(deltaX: number, deltaY: number) {
    const translateMatrix = this.getTranslationMatrix(deltaX, deltaY);
    this.draggableElement.style.transform = translateMatrix.toString();
  }

  private getTranslationMatrix(deltaX: number, deltaY: number): DOMMatrix {
    const draggableRect = this.draggableElement.getBoundingClientRect();
    const movedDraggableRect = new DOMRect(
      draggableRect.x + deltaX,
      draggableRect.y + deltaY,
      draggableRect.width,
      draggableRect.height,
    );
    const selectionRect = this.selectionElement.getBoundingClientRect();
    const overflowTable = getOverflowTable(selectionRect, movedDraggableRect);

    const vectorX =
      overflowTable.horizontal !== null
        ? this.getSnapX(overflowTable.horizontal)
        : deltaX;
    const vectorY =
      overflowTable.vertical !== null
        ? this.getSnapY(overflowTable.vertical)
        : deltaY;

    return new DOMMatrix(this.draggableElement.style.transform).translate(
      vectorX,
      vectorY,
    );
  }

  private getSnapX(overflow: HorizontalOverflow) {
    const transformMatrix = new DOMMatrix(
      this.draggableElement.style.transform,
    );
    switch (overflow) {
      case HorizontalOverflow.Left:
        return -this.draggableElement.offsetLeft - transformMatrix.e;
      case HorizontalOverflow.Right:
        return this.draggableElement.offsetLeft - transformMatrix.e;
    }
  }

  private getSnapY(overflow: VerticalOverflow) {
    const transformMatrix = new DOMMatrix(
      this.draggableElement.style.transform,
    );
    switch (overflow) {
      case VerticalOverflow.Top:
        return -this.draggableElement.offsetTop - transformMatrix.f;
      case VerticalOverflow.Bottom:
        return this.draggableElement.offsetTop - transformMatrix.f;
    }
  }

  private async writeCanvasToFile(canvas: HTMLCanvasElement): Promise<File> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob === null)
            return reject(
              new CropperError("Cropped Image could not be created"),
            );

          return resolve(
            new File(
              [blob],
              `cropped-file.${this.settings.fileFormatMetadata.extension}`,
              {
                type: blob.type,
              },
            ),
          );
        },
        this.settings.fileFormatMetadata.mimeType,
        this.settings.qualitySetting,
      );
    });
  }
}

window.customElements.define("sigma-cropper", Cropper);
