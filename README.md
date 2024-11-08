# About

A WebComponent for cropping even-sized portions of an input image.

## What's included

- Crop out `N x N` portion of input image
- Scale input image
- Specify output format
- Specify output image quality

# Usage

First you need to register `sigma-cropper` to
the [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry). The bundle file is
output as an IIFE script. Importing the file will automatically
register the `sigma-cropper` WebComponent.

```ts
// Import module
import "sigma-cropper"

// Import module & <sigma-cropper> class
import {SigmaCropper} from "sigma-cropper"

// Import <sigma-cropper> class type
import type {SigmaCropper} from "sigma-cropper"
```

You can then use it as every other HTMLElement, be it via HTML or JSX:

```html

<div class="my-wrapper">
    <sigma-cropper src="https://example.com/cat.jpg" format="webp" quality="0.75">
        <div class="my-slot" slot="selection"></div>
    </sigma-cropper>
</div>
```

Check out the [examples](https://github.com/SzymonMakula/sigma-cropper/tree/main/docs/examples) for implementation
guidance.

# Documentation

## Attributes

- `src: string` - A valid URL pointing to input image
- `format: "jpeg" | "png" | "webp"` - Output image file format.
- `quality: number` - Floating point number between 0 and 1, with 0 indicating lowest quality output image and 1 of the
  highest quality.

## Slots

- `selection` - HTMLElement represeting the "cropping area". The Element width and height are both set
  to `var(--cropper-min-w")px`. Any parts of the input image that fall into the slot Element area are copied over to the
  output image. Use this
  slot to style the selection element according to your needs. Do not modify the slots dimensions - these are to be
  handled internally by the WebComponent itself.

## CSS variables

- `--cropper-min-w: number` - Specifies the `N x N` selection area dimension. The value must be an integer and it's
  value will be internally converted into a dimension specified in `pixels`.

# Developing

Install dependencies

```bash
npm i
```

Run the bundler in "watch" mode:

```bash
npm run dev
```

Import the output bundle file `dist/index.js` into the HTML file where you use the `sigma-cropper`. Open the HTML file
in your browser. Happy coding.
  
