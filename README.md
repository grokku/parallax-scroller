# 🔭 Parallax-Scroller

Parallax-Scroller is a versatile JavaScript module that creates captivating
parallax scrolling effects, perfect for enhancing the visual appeal and
interactivity of web pages.

## Functionality

- **Data-Driven**: Using `data-` attributes to define animations.
- **Customizable**: Specify keyframe styles at various scroll points, with
  smooth interpolation between them.
- **Event Handling**: Listener functionality for scroll events, providing
  information about the scrolling stage, progress, and affected elements.
- **Lifecycle Management**: Straightforward methods for initializing and safely
  destroying scroll animations.

## Installation

To install the module, run:

```bash
npm install @grokku/parallax-scroller
```

Or if you prefer using Yarn:

```bash
yarn add @grokku/parallax-scroller
```

## Requirements

- JavaScript ES6+
- This module is an ECMAScript Module (ESM) and requires a JavaScript
  environment that supports ES Modules.

## API Reference

**init**: Initializes the scroller by parsing keyframes and initiating the
animation loop. Accepts an optional configuration object, including a root
element and a listener. If no root is specified, the document body is used by
default. The listener is triggered during the init lifecycle event for each
defined element and when passing any of the defined keyframes, in both forward
and backward directions.

**destroy**: Deactivates the scroller, removing applied styles and event
listeners to reset the state.

### Example Usage

Vanilla JavaScript:

```javascript
import { init } from "@grokku/parallax-scroller";

init({
  root: document.getElementById("root"),
  listener: ({ name, stage, percentage, cssProp }) => {
    // Handle scroll events
  },
});
```

React Component:

```javascript
import React, { useEffect } from "react";
import { init, destroy } from "@grokku/parallax-scroller";

const ParallaxComponent = () => {
  const listener = ({ name, stage, percentage, cssProp }) => {
    // Custom scroll event handling
  };

  useEffect(() => {
    init({ listener });
    return destroy;
  }, []);

  return <div>Your content here</div>;
};

export default ParallaxComponent;
```

### HTML Structure

Each animated element should have a data-scroll attribute with a unique name for
event tracking and debugging purposes. Define keyframes by adding
data-[PERCENTAGE]p attributes with a style string, similar to the style
attribute. Ensure consistency in the list of styles across all keyframes for
a given element.

```html
<div
  data-scroll="demo"
  data-50p="opacity: 0; margin-left: 0px; margin-top: 0px; transform: rotate(0deg) scale(0);"
  data-150p="opacity: 1; margin-left: 500px; margin-top: 0px; transform: rotate(180deg) scale(2);"
>
  🚗
</div>
```

**Consistency is Key**: Maintain the same set of styles across all keyframes for
an element. Avoid adding or removing styles in different keyframes.

If you apply conflicting styles via `style` and `data-[PERCENTAGE]p` attributes,
the former will be overwritten with the value that is currently interpolated in
`data-[PERCENTAGE]p`. For example

```html
<div
  data-scroll="demo"
  style="transform: scale(2)"
  data-0p="transform: translateX(0px)"
  data-120p="transform: translateX(100px)"
>
  🚌
</div>
```

`transform: scale(2)` will be overwritten. In order to keep it, you have to
either add it to each `data-[PERCENTAGE]p` like:

```html
<div
  data-scroll="demo"
  data-0p="transform: translateX(0px) scale(2)"
  data-120p="transform: translateX(100px) scale(2)"
>
  🚌
</div>
```

Or wrap contents with an element that has desired style:

```html
<div
  data-scroll="demo"
  data-0p="transform: translateX(0px)"
  data-120p="transform: translateX(100px)"
>
  <span style="transform: scale(2)">🚌</span>
</div>
```

## Performance Tips

- **Element Grouping**: Group elements with similar animations under a common
  parent to optimize rendering.
- **Minimize Redundancy**: Avoid unnecessary or unchanging data-[PERCENTAGE]p
  attributes.
- **Optimize Styles**: Only animate properties that change during scroll.

## Contributing

Contributions to the "Parallax-Scroller" action are welcome. Please ensure that
your contributions adhere to the project's coding standards and include
appropriate tests.
