import { scrollManager } from "./config.js";
import { initElements, initRootElement } from "./elements-initializer.js";
import { setListener } from "./listener.js";
import { loopUpdatePositions } from "./render.js";
import type { ParallaxScrollerListenerParams } from "./types.js";
import { debounce } from "./utils.js";

interface InitParams {
  listener?: (params: ParallaxScrollerListenerParams) => void;
  root?: HTMLElement;
}

let debouncedInitElements: (() => void) | null = null;

/**
 * Parallax Scroller initializer.
 *
 * 1. It iterates through all HTML elements with "data-scroll" attribute and
 * parses `data-{$percent}p` properties into keyframes. Than it takes first
 * keyframe and applies initial styles to the elements.
 *
 * $percent is the scrolling percentage of the viewport height, it can start
 * from 0p to infinite number, i.e 300p means 300% or 3 times the viewport
 * height.
 *
 * 2. Based on the maximum keyframe value, it sets the height of body element.
 *
 * 3. Starts the loop, which re-renders elements positions based on scroll
 * position.
 *
 * data-scroll attribute can take a name of an element for debugging
 * convenience.
 */
export const init = ({ listener, root = document.body }: InitParams) => {
  if (!(root instanceof HTMLElement)) {
    throw new Error("Invalid root element");
  }

  setListener(listener);

  initRootElement(root);
  const scrollElements = initElements();

  if (debouncedInitElements) {
    window.removeEventListener("resize", debouncedInitElements);
  }

  debouncedInitElements = debounce(initElements, 250);

  window.addEventListener("resize", debouncedInitElements);

  loopUpdatePositions(scrollElements);
};

/**
 * Parallax Scroller destroyer.
 *
 * Resets scroller state, clears styling side effects to DOM and removes
 * listeners
 */
export const destroy = () => {
  setListener();
  scrollManager.setIsActive(false);
  scrollManager.setFullViewHeight(0);
  scrollManager.setMaxPercentage(0);

  document.body.style.removeProperty("height");

  if (debouncedInitElements) {
    window.removeEventListener("resize", debouncedInitElements);
    debouncedInitElements = null;
  }
};
