import { Cropper } from "./main";

export interface EventHandler {
  registerHandler: VoidFunction;
  removeHandler: VoidFunction;
}

export function mouseHandlerFactory(this: Cropper): EventHandler {
  const onMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    this.moveDraggable(event.movementX, event.movementY);
  };

  const onMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    this.draggableElement.style.cursor = "grabbing";
    window.addEventListener("mousemove", onMouseMove, false);
  };

  const onMouseUp = (event: MouseEvent) => {
    this.draggableElement.style.cursor = "grab";
    window.removeEventListener("mousemove", onMouseMove, false);
  };

  const registerHandler = () => {
    this.draggableElement.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mouseup", onMouseUp, false);
  };

  const removeHandler = () => {
    window.removeEventListener("mouseup", onMouseUp, false);
  };

  return {
    registerHandler,
    removeHandler,
  };
}
