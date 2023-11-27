import { scrollManager } from "./config.js";
import { setElementKeyframes, sortKeyframes } from "./keyframes.js";
import { notify } from "./listener.js";
import { parseKeyframeStyles } from "./parser.js";
import {
  PARALLAX_SCROLLER_STAGE,
  type ParallaxScrollerElement,
} from "./types.js";
import { substituteStyleValue } from "./utils.js";

const regexDataAttribute = /^data-(\d*)p$/;

/**
 * Take a parsed CSS style at 0% scroll and apply it to the element.
 * @private
 *
 * @param {ParallaxScrollerElement} element
 */
const setInitialStyle = (element: ParallaxScrollerElement) => {
  Object.entries(element.styles).forEach(([cssProp, config]) => {
    if (config[0].constant === 0) {
      const cssValue = config[0].values.length
        ? substituteStyleValue(config[0].template, config[0].values)
        : config[0].template;

      element.node.style.setProperty(cssProp, cssValue);
    }
  });
};

const processAttribute = (attr: Attr, element: ParallaxScrollerElement) => {
  const match = attr.name.match(regexDataAttribute);
  if (!match) return false;

  const constant = parseInt(match[1], 10) / 100;
  const props = parseKeyframeStyles(attr.value);

  if (constant > scrollManager.getMaxPercentage()) {
    scrollManager.setMaxPercentage(constant);
  }

  setElementKeyframes(props, element, constant);
  return true;
};

/**
 * Parse scrollable element, reading all `data-{$percent}p` attributes into
 * sorted list of keyframes and apply styles from initial keyframe.
 * Calculate maximum scroll percentage to adjust viewport height.
 *
 * The attributes are as following:
 *
 * data-0p='transform: translate(0, 0)'
 * data-300p='transform: translate(300px, -100px)'
 * data-scroll='hero'
 *
 * @param {HTMLElement} node
 *
 * @returns {ParallaxScrollerElement} `constant` property signifies scroll
 * percentage, where 0 is 0% and 3 is 300%. So based on this the viewport height
 * is multiplied by 3. Example ParallaxScrollerElement:
 *
 * {
 *  name: 'hero',
 *  node: HTMLElement,
 *  styles: {
 *    transform: [
 *      {
 *        constant: 0,
 *        template: 'translate({?}, {?})',
 *        values: [ 0, 0 ]
 *      },
 *      {
 *        constant: 3,
 *        template: 'translate({?}px, {?}px)',
 *        values: [ 300, -100 ]
 *      }
 *    ]
 *  }
 * }
 */
const initElement = (node: HTMLElement) => {
  const name = node.getAttribute("data-scroll");

  if (!node.attributes || !name) return;

  const element: ParallaxScrollerElement = { name, node, styles: {} };

  notify({ name, stage: PARALLAX_SCROLLER_STAGE.init });

  const attrs = node.attributes;
  for (let i = 0, len = attrs.length; i < len; i++) {
    processAttribute(attrs[i], element);
  }

  sortKeyframes(element);
  setInitialStyle(element);

  return element;
};

/**
 * Find all elements with with "data-scroll" attribute and calculate viewport
 * height based on maximum `data-{$percent}p` value.
 * @private
 *
 * @returns {ParallaxScrollerElement[]} List of animated elements
 */
export const initElements = () => {
  const nodes = document.querySelectorAll<HTMLElement>("[data-scroll]");
  const elements = Array.from(nodes).reduce((acc, node) => {
    const element = initElement(node);
    if (element) {
      acc.push(element);
    }
    return acc;
  }, [] as Array<ParallaxScrollerElement>);

  const fullViewHeight = scrollManager.getMaxPercentage() * window.innerHeight;

  scrollManager.setIsActive(true);
  scrollManager.setFullViewHeight(fullViewHeight);
  document.body.style.height = `${fullViewHeight}px`;

  return elements;
};

/**
 *
 * @param root
 */
export const initRootElement = (root: HTMLElement) => {
  root.style.position = "fixed";
  root.style.top = "0";
  root.style.left = "0";
  root.style.width = "100%";
  root.style.height = "100%";
};
