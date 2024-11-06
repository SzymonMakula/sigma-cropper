import { Cropper } from "./main";
import { EventHandler } from "./mouseEvents";

export function touchHandlerFactory(this: Cropper): EventHandler {
  let previousTouch: Touch | null = null;
  const onTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    this.draggableElement.style.cursor = "grabbing";
    window.addEventListener("touchmove", onTouchMove, false);
  };

  const onTouchEnd = () => {
    this.draggableElement.style.cursor = "grab";
    window.removeEventListener("touchmove", onTouchMove, false);
  };
  const onTouchMove = (event: TouchEvent) => {
    const [touch] = event.touches;
    event.preventDefault();
    if (previousTouch !== null) {
      const movementX = touch.pageX - previousTouch.pageX;
      const movementY = touch.pageY - previousTouch.pageY;
      this.moveDraggable(movementX, movementY);
    }
    previousTouch = touch;
  };

  const registerHandler = () => {
    this.draggableElement.addEventListener("touchstart", onTouchStart, false);
    window.addEventListener("touchend", onTouchEnd, false);
  };

  const removeHandler = () => {
    this.mouseHandler.removeHandler();
    window.removeEventListener("touchend", onTouchEnd, false);
  };

  return { registerHandler, removeHandler };
}
