import { initElements, initRootElement } from "./elements-initializer"; // Adjust the import path
import { scrollManager } from "./config.js";
import { setListener } from "./listener";
import { PARALLAX_SCROLLER_STAGE } from "./types";

describe("initElements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  test("should initialize all elements with data-scroll attribute", () => {
    const listener = jest.fn();
    setListener(listener);

    const hero = document.createElement("div");
    hero.setAttribute("data-scroll", "hero");
    hero.setAttribute("data-0p", "opacity: 0");
    hero.setAttribute("data-50p", "opacity: 0.5");
    document.body.appendChild(hero);

    const tree = document.createElement("div");
    tree.setAttribute("data-scroll", "tree");
    tree.setAttribute("data-0p", "opacity: 0");
    tree.setAttribute("data-250p", "opacity: 1");
    document.body.appendChild(tree);

    const ignored = document.createElement("div");
    ignored.setAttribute("data-20p", "opacity: 0");
    ignored.setAttribute("data-400p", "opacity: 1");
    document.body.appendChild(ignored);

    const broken = document.createElement("div");
    broken.setAttribute("data-scroll", "");
    broken.setAttribute("data-0p", "opacity: 0");
    broken.setAttribute("data-350p", "opacity: 1");
    document.body.appendChild(broken);

    expect(listener).not.toHaveBeenCalledWith({
      name: "hero",
      stage: PARALLAX_SCROLLER_STAGE.init,
    });
    expect(listener).not.toHaveBeenCalledWith({
      name: "tree",
      stage: PARALLAX_SCROLLER_STAGE.init,
    });

    const result = initElements();

    expect(result.length).toBe(2);
    expect(scrollManager.isActive()).toBe(true);
    expect(scrollManager.getMaxPercentage()).toBe(2.5);
    expect(scrollManager.getFullViewHeight()).toBe(2.5 * window.innerHeight);
    expect(document.body.style.height).toBe(`${2.5 * window.innerHeight}px`);

    expect(listener).toHaveBeenCalledWith({
      name: "hero",
      stage: PARALLAX_SCROLLER_STAGE.init,
    });
    expect(listener).toHaveBeenCalledWith({
      name: "tree",
      stage: PARALLAX_SCROLLER_STAGE.init,
    });
    expect(listener).not.toHaveBeenCalledWith({
      name: "ignored",
      stage: PARALLAX_SCROLLER_STAGE.init,
    });
    expect(listener).not.toHaveBeenCalledWith({
      name: "broken",
      stage: PARALLAX_SCROLLER_STAGE.init,
    });
  });
});

describe("initRootElement", () => {
  test("should set custom root element styles if provided", () => {
    const customRoot = document.createElement("div");
    document.body.appendChild(customRoot);

    initRootElement(customRoot);

    expect(customRoot.style.position).toBe("fixed");
    expect(customRoot.style.top).toBe("0px");
    expect(customRoot.style.left).toBe("0px");
    expect(customRoot.style.width).toBe("100%");
    expect(customRoot.style.height).toBe("100%");
  });
});
