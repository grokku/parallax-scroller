import { scrollManager } from "./config";
import { setStylesForKeyframes } from "./keyframes";
import { type ParallaxScrollerElement } from "./types";
import { calculatePageScrollPercent } from "./utils";

let lastScrollPercent = -1;
let animationFrameId: number | null = null;

/**
 * Update all ParallaxScrollerElements with style values based on page scroll
 * percentage.
 * @private
 *
 * @param scrollElements
 */
const renderElements = (scrollElements: Array<ParallaxScrollerElement>) => {
  const percent = calculatePageScrollPercent();

  // Only update if the scroll percentage has changed
  if (percent !== lastScrollPercent) {
    scrollElements.forEach((element) =>
      setStylesForKeyframes(element, percent)
    );
    lastScrollPercent = percent;
  }
};

/**
 * Updating elements position.
 * @private
 */
export const loopUpdatePositions = (
  scrollElements: Array<ParallaxScrollerElement>
) => {
  renderElements(scrollElements);

  if (scrollManager.isActive()) {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = window.requestAnimationFrame(() =>
      loopUpdatePositions(scrollElements)
    );
  } else if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};
