export type OverflowTable = {
  horizontal: HorizontalOverflow | null;
  vertical: VerticalOverflow | null;
};

export enum HorizontalOverflow {
  Left,
  Right,
}

export enum VerticalOverflow {
  Top,
  Bottom,
}

export function getOverflowTable(
  parent: DOMRect,
  target: DOMRect,
): OverflowTable {
  let horizontalOverflow = null;
  let verticalOverflow = null;

  if (parent.left < target.left) {
    horizontalOverflow = HorizontalOverflow.Left;
  } else if (parent.right > target.right)
    horizontalOverflow = HorizontalOverflow.Right;

  if (parent.top < target.top) {
    verticalOverflow = VerticalOverflow.Top;
  } else if (parent.bottom > target.bottom) {
    verticalOverflow = VerticalOverflow.Bottom;
  }

  return {
    horizontal: horizontalOverflow,
    vertical: verticalOverflow,
  };
}
