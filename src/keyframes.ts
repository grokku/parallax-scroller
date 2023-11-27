import { scrollManager } from "./config";
import { notify } from "./listener";
import { parseProp } from "./parser";
import {
  Keyframe,
  PARALLAX_SCROLLER_STAGE,
  type ParallaxScrollerElement,
} from "./types";
import { interpolate, substituteStyleValue } from "./utils";

let previousPoints: Record<string, number> = {};

/**
 * @typedef {Object} Tweening
 * @property {Keyframe} from starting keyframe point
 * @property {Keyframe} to ending keyframe point
 */

/**
 * Convert element props into style keyframes.
 *
 * @param {KeyframeStyles[]} props Array of key-values objects where key is a
 * CSS property and value is a value of this property.
 * @param {ParallaxScrollerElement} element
 * @param {number} constant Signifies scroll percentage
 *
 * @returns void
 */
export const setElementKeyframes = (
  props: Array<Record<string, string>>,
  element: ParallaxScrollerElement,
  constant: number
) => {
  if (typeof constant !== "number") {
    throw new Error(
      `Scroll percentage must be an integer, got "${constant}" instead`
    );
  }

  props.forEach((prop) => {
    const { rule, template, values } = parseProp(prop);
    if (!rule) return;

    const keyframe = { constant, template, values };
    element.styles[rule] = (element.styles[rule] || []).concat(keyframe);
  });
};

/**
 * Sort keyframes by percentage to apply initial styles correctly
 * @private
 *
 * @param {ParallaxScrollerElement} element
 */
export const sortKeyframes = (element: ParallaxScrollerElement) => {
  Object.keys(element.styles).forEach((style) => {
    element.styles[style].sort((a, b) => a.constant - b.constant);
  });
};

/**
 * Sends notifications for scroll checkpoints.
 * @private
 *
 * @param {ParallaxScrollerElement} element - The target element.
 * @param {number} point - Current scroll point.
 * @param {Tweening} tweening - Object with `from` and `to` keyframes.
 *
 * @returns True if a notification was sent, false otherwise.
 */
const notifyCheckpoint = (
  element: ParallaxScrollerElement,
  point: number,
  { from, to }: { from: Keyframe; to?: Keyframe }
) => {
  const fromWindow = from.constant * window.innerHeight;
  const previousPoint = previousPoints[element.name] ?? -1;

  if (point >= fromWindow && previousPoint < fromWindow) {
    notifyChange(
      element.name,
      from.constant,
      PARALLAX_SCROLLER_STAGE.scrollForward
    );

    return true;
  }

  if (point <= fromWindow && previousPoint > fromWindow) {
    notifyChange(
      element.name,
      from.constant,
      PARALLAX_SCROLLER_STAGE.scrollBackward
    );

    return true;
  }

  if (to) {
    const toWindow = to.constant * window.innerHeight;

    if (point >= toWindow && previousPoint < toWindow) {
      notifyChange(
        element.name,
        to.constant,
        PARALLAX_SCROLLER_STAGE.scrollForward
      );
      return true;
    }

    if (point <= toWindow && previousPoint > toWindow) {
      notifyChange(
        element.name,
        to.constant,
        PARALLAX_SCROLLER_STAGE.scrollBackward
      );
      return true;
    }
  }

  return false;
};

/**
 * Notifies about a scroll checkpoint change.
 * @private
 *
 * @param {string} name - Name of the target element.
 * @param {number} constant - Scroll constant.
 * @param {string} stage - Scroll stage.
 */
const notifyChange = (
  name: string,
  constant: number,
  stage: PARALLAX_SCROLLER_STAGE
) => {
  notify({
    name,
    checkpoint: constant * 100,
    stage,
  });
};

/**
 * Calculates the relative scroll percentage between two points.
 * @private
 *
 * @param {number} point - Current scroll point.
 * @param {number} fromWindow - Start point in window height units.
 * @param {number|null} toWindow - End point in window height units.
 *
 * @returns {number} Relative scroll percentage.
 */
const calculateRelativePercent = (
  point: number,
  fromWindow: number,
  toWindow: number
) => {
  if (point >= toWindow) {
    return 1;
  } else if (fromWindow <= point && point <= toWindow) {
    return (point - fromWindow) / (toWindow - fromWindow);
  }

  return 0;
};

/**
 * Interpolates values between two keyframe value sets.
 * @private
 *
 * @param {string[]} fromValues - Start keyframe values.
 * @param {string[]} toValues - End keyframe values.
 * @param {number} percent - Relative percentage.
 *
 * @returns {string[]} Interpolated values.
 */
const interpolateValues = (
  fromValues: Array<number>,
  toValues: Array<number>,
  percent: number
) => fromValues.map((from, i) => interpolate(from, toValues[i], percent));

/**
 * Applies CSS styles to a ParallaxScrollerElement node.
 * @private
 *
 * @param {ParallaxScrollerElement} element - The target element.
 * @param {number} point - Absolute scroll value in pixels.
 * @param {string} cssProp - Name of CSS property.
 * @param {Tweening} tweening - Object with `from` and `to` keyframes.
 *
 * @returns {boolean} True if styles were applied, false otherwise.
 */
const applyStyle = (
  element: ParallaxScrollerElement,
  point: number,
  cssProp: string,
  { from, to }: { from: Keyframe; to?: Keyframe }
) => {
  const fromWindow = from.constant * window.innerHeight;

  if (to) {
    const toWindow = to.constant * window.innerHeight;

    if (from.values.length && to.values.length) {
      if (from.values.length !== to.values.length) {
        throw new Error("Styles between keyframes must match");
      }

      const relativePercent = calculateRelativePercent(
        point,
        fromWindow,
        toWindow
      );
      const calculatedStyleValues = interpolateValues(
        from.values,
        to?.values,
        relativePercent
      );

      element.node.style.setProperty(
        cssProp,
        substituteStyleValue(to.template, calculatedStyleValues)
      );

      return point >= fromWindow && point <= toWindow!;
    } else {
      if (point >= toWindow) {
        element.node.style.setProperty(cssProp, to.template);
        return true;
      } else if (point >= fromWindow) {
        element.node.style.setProperty(cssProp, from.template);
        return true;
      }
    }
  } else if (point >= fromWindow) {
    if (from.values.length) {
      element.node.style.setProperty(
        cssProp,
        substituteStyleValue(from.template, from.values)
      );
    } else {
      element.node.style.setProperty(cssProp, from.template);
    }
    return true;
  }

  return false;
};

/**
 * Applies style for a specific frame.
 *
 * @param {ParallaxScrollerElement} element - Target element.
 * @param {number} point - Current scroll point.
 * @param {string} cssProp - CSS property name.
 * @param {Tweening} tweening - Object with `from` and `to` keyframes.
 *
 * @returns {boolean} True if the frame was applied, false otherwise.
 */
export const applyFrameStyle = (
  element: ParallaxScrollerElement,
  point: number,
  cssProp: string,
  { from, to }: { from: Keyframe; to?: Keyframe }
) => {
  const fromWindow = from.constant * window.innerHeight;
  const toWindow = to ? to.constant * window.innerHeight : null;

  // Check if the current point is outside the range of the current frame
  if (
    (point < fromWindow && previousPoints[element.name] < fromWindow) ||
    (toWindow !== null &&
      point >= toWindow &&
      previousPoints[element.name] >= toWindow)
  ) {
    return false;
  }

  return applyStyle(element, point, cssProp, { from, to });
};

/**
 * Apply styles with calculated scroll percentage to the given
 * ParallaxScrollerElement.
 * @private
 *
 * @param {ParallaxScrollerElement} element
 * @param {number} percent Scrolled percentage relative to full viewport height
 *
 * @returns void
 */
export const setStylesForKeyframes = (
  element: ParallaxScrollerElement,
  percent: number
) => {
  const point = percent * scrollManager.getFullViewHeight();
  const { name } = element;

  // Skip loop window is not scrolled
  if (point === previousPoints[name]) return;

  let isNotified = false;
  const keyframes = Object.entries(element.styles);
  keyframes.forEach(([cssProp, frames]) => {
    for (let i = 0; i < frames.length; i++) {
      const from = frames[i];
      const to = frames[i + 1];
      const frameApplied = applyFrameStyle(element, point, cssProp, {
        from,
        to,
      });

      if (!isNotified) {
        isNotified = notifyCheckpoint(element, point, { from, to });
      }

      if (frameApplied) break;
    }
  });

  previousPoints[name] = point;
};
