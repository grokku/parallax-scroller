import { scrollManager } from "./config";
import {
  applyFrameStyle,
  setElementKeyframes,
  setStylesForKeyframes,
  sortKeyframes,
} from "./keyframes";
import { setListener } from "./listener";
import { PARALLAX_SCROLLER_STAGE, type ParallaxScrollerElement } from "./types";

const getMockElement = (name = "testElement"): ParallaxScrollerElement => ({
  name,
  node: document.createElement("div"),
  styles: {},
});

describe("setElementKeyframes", () => {
  test("should set keyframes correctly for given props and constant", () => {
    const mockProps: Array<Record<string, string>> = [
      { transform: "translate(300px, 0)" },
      { opacity: "0.5" },
      {},
    ];
    const mockElement = getMockElement();
    const constant = 0.5;

    setElementKeyframes(mockProps, mockElement, constant);

    expect(mockElement.styles).toHaveProperty("transform");
    expect(mockElement.styles.transform).toHaveLength(1);
    expect(mockElement.styles.transform[0]).toEqual({
      constant: 0.5,
      template: "translate({?}px, {?})",
      values: [300, 0],
    });

    expect(mockElement.styles).toHaveProperty("opacity");
    expect(mockElement.styles.opacity).toHaveLength(1);
    expect(mockElement.styles.opacity[0]).toEqual({
      constant: 0.5,
      template: "{?}",
      values: [0.5],
    });
  });

  test("should handle an empty props array without errors", () => {
    const mockElement = {
      name: "testElement",
      node: document.createElement("div"),
      styles: {},
    };
    const constant = 0.5;

    setElementKeyframes([], mockElement, constant);

    expect(mockElement.styles).toEqual({});
  });

  test("should handle unusual constant values correctly", () => {
    const mockProps = [{ transform: "translate(300px, 0)" }];
    const mockElement = getMockElement();

    setElementKeyframes(mockProps, mockElement, -0.5);
    expect(mockElement.styles.transform[0].constant).toEqual(-0.5);

    setElementKeyframes(mockProps, mockElement, 1000);
    expect(mockElement.styles.transform[1].constant).toEqual(1000);

    expect(() => {
      setElementKeyframes(
        mockProps,
        mockElement,
        "invalid" as unknown as number,
      );
    }).toThrow('Scroll percentage must be an integer, got "invalid" instead');
  });
});

describe("sortKeyframes", () => {
  test("should sort keyframes in ascending order of their constant values", () => {
    const mockElement = {
      ...getMockElement(),
      styles: {
        transform: [
          { constant: 0.5, template: "...", values: [] },
          { constant: 0.1, template: "...", values: [] },
          { constant: 0.3, template: "...", values: [] },
        ],
      },
    };

    sortKeyframes(mockElement);

    expect(mockElement.styles.transform[0].constant).toEqual(0.1);
    expect(mockElement.styles.transform[1].constant).toEqual(0.3);
    expect(mockElement.styles.transform[2].constant).toEqual(0.5);
  });

  test("should correctly handle keyframes with same or extreme constant values", () => {
    const mockElement = {
      ...getMockElement(),
      styles: {
        transform: [
          { constant: 1000, template: "...", values: [] },
          { constant: 0.5, template: "...", values: [] },
          { constant: 0.5, template: "...", values: [] },
          { constant: -1, template: "...", values: [] },
        ],
      },
    };

    sortKeyframes(mockElement);

    expect(mockElement.styles.transform[0].constant).toEqual(-1);
    expect(mockElement.styles.transform[1].constant).toEqual(0.5);
    expect(mockElement.styles.transform[2].constant).toEqual(0.5);
    expect(mockElement.styles.transform[3].constant).toEqual(1000);
  });

  test("should handle when no keyframes without errors", () => {
    const mockElement = getMockElement();

    sortKeyframes(mockElement);

    expect(mockElement.styles).toEqual({});
  });

  test("should handle when a single keyframe without errors", () => {
    const mockElement = {
      ...getMockElement(),
      styles: {
        transform: [{ constant: 0.2, template: "...", values: [] }],
      },
    };

    sortKeyframes(mockElement);

    expect(mockElement.styles.transform).toHaveLength(1);
    expect(mockElement.styles.transform[0].constant).toEqual(0.2);
  });
});

describe("applyFrameStyle", () => {
  test("should correctly apply interpolated styles based on keyframes and scroll point", () => {
    const mockElement = getMockElement();
    const cssProp = "transform";
    const fromKeyframe = {
      constant: 0.1,
      template: "translateX({?}px)",
      values: [0],
    };
    const toKeyframe = {
      constant: 0.2,
      template: "translateX({?}px)",
      values: [100],
    };
    const scrollPoint = 0.15 * window.innerHeight; // Midway between from and to

    expect(
      applyFrameStyle(mockElement, scrollPoint, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(true);

    expect(mockElement.node.style.transform).toBe(
      "translateX(49.999999999999964px)", // Floating-point arithmetic imprecision inherent in JavaScript
    );
  });

  test("should handle edge cases of scroll points correctly", () => {
    const mockElement = getMockElement();
    const cssProp = "opacity";
    const fromKeyframe = { constant: 0.1, template: "{?}", values: [0] };
    const toKeyframe = { constant: 0.2, template: "{?}", values: [1] };

    // Scroll point before the start keyframe
    expect(
      applyFrameStyle(mockElement, 0.05 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(false);
    expect(mockElement.node.style.opacity).toBe("0");

    // Scroll point after the end keyframe
    expect(
      applyFrameStyle(mockElement, 0.25 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(false);
    expect(mockElement.node.style.opacity).toBe("1");
  });

  test("should apply styles directly when scroll point matches keyframe exactly", () => {
    const mockElement = getMockElement();
    const cssProp = "width";
    const fromKeyframe = { constant: 0.1, template: "{?}%", values: [50] };
    const toKeyframe = { constant: 0.2, template: "{?}%", values: [100] };

    // Scroll point exactly at the start keyframe
    expect(
      applyFrameStyle(mockElement, 0.1 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.width).toBe("50%");

    // Scroll point exactly at the end keyframe
    expect(
      applyFrameStyle(mockElement, 0.2 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.width).toBe("100%");
  });

  test("should apply styles correctly when only from keyframe is provided and scroll point is before, at or beyond this keyframe", () => {
    const mockElement = getMockElement();
    const cssProp = "opacity";
    const fromKeyframe = { constant: 0.2, template: "{?}", values: [1] };

    // Scroll point before the keyframe
    expect(
      applyFrameStyle(mockElement, 0.1 * window.innerHeight, cssProp, {
        from: fromKeyframe,
      }),
    ).toBe(false);
    expect(mockElement.node.style.opacity).toBe("");

    // Scroll point at the keyframe
    expect(
      applyFrameStyle(mockElement, 0.2 * window.innerHeight, cssProp, {
        from: fromKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.opacity).toBe("1");

    // Scroll point beyond the keyframe
    expect(
      applyFrameStyle(mockElement, 0.3 * window.innerHeight, cssProp, {
        from: fromKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.opacity).toBe("1");
  });

  test("should apply to keyframe style when scroll point is at or beyond to keyframe", () => {
    const mockElement = getMockElement();
    const cssProp = "display";
    const fromKeyframe = {
      constant: 0.2,
      template: "block",
      values: [],
    };
    const toKeyframe = {
      constant: 0.3,
      template: "none",
      values: [],
    };
    // Scroll point before the keyframe
    expect(
      applyFrameStyle(mockElement, 0.1 * window.innerHeight, cssProp, {
        from: fromKeyframe,
      }),
    ).toBe(false);
    expect(mockElement.node.style.display).toBe("");

    // Scroll point at the from keyframe
    expect(
      applyFrameStyle(mockElement, 0.2 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.display).toBe("block");

    // Scroll point at the to keyframe
    expect(
      applyFrameStyle(mockElement, 0.3 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.display).toBe("none");

    // Scroll point beyond the to keyframe
    expect(
      applyFrameStyle(mockElement, 0.4 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.display).toBe("none");
  });

  test("should apply from keyframe style when scroll point is between from and to keyframes without numeric values", () => {
    const mockElement = getMockElement();
    const cssProp = "display";
    const fromKeyframe = { constant: 0.1, template: "block", values: [] };
    const toKeyframe = { constant: 0.2, template: "none", values: [] };

    // Scroll point between from and to keyframes
    expect(
      applyFrameStyle(mockElement, 0.15 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.display).toBe("block");
  });

  test("should apply styles correctly when only from keyframe is provided and scroll point is after beyond this keyframe without numeric values", () => {
    const mockElement = getMockElement();
    const cssProp = "display";
    const fromKeyframe = { constant: 0.1, template: "block", values: [] };

    // Scroll point between from and to keyframes
    expect(
      applyFrameStyle(mockElement, 0.15 * window.innerHeight, cssProp, {
        from: fromKeyframe,
      }),
    ).toBe(true);
    expect(mockElement.node.style.display).toBe("block");
  });

  test("should throw an error if from and to keyframes have mismatched values length", () => {
    const mockElement = {
      name: "testElement",
      node: document.createElement("div"),
      styles: {},
    };
    const cssProp = "transform";
    const fromKeyframe = {
      constant: 0.1,
      template: "translateX({?}%)",
      values: [0],
    };
    const toKeyframe = {
      constant: 0.2,
      template: "translateX({?}%) scaleY({?})",
      values: [100, 1.5],
    };

    // Expect the function to throw an error due to mismatched values length
    expect(() => {
      applyFrameStyle(mockElement, 0.15 * window.innerHeight, cssProp, {
        from: fromKeyframe,
        to: toKeyframe,
      });
    }).toThrow("Styles between keyframes must match");
  });
});

describe("setStylesForKeyframes", () => {
  test("should correctly apply styles at different scroll percentages", () => {
    window.innerHeight = 800; // Mocking window.innerHeight for testing
    scrollManager.setFullViewHeight(1600); // Max constant is 2 so full view height should be 1600

    const mockElement = {
      ...getMockElement(),
      styles: {
        opacity: [
          { constant: 0, template: "{?}", values: [0] },
          { constant: 1, template: "{?}", values: [1] },
        ],
        transform: [
          { constant: 0, template: "translateX({?}%)", values: [0] },
          { constant: 2, template: "translateX({?}%)", values: [100] },
        ],
      },
    };

    // 0% scroll
    setStylesForKeyframes(mockElement, 0);
    expect(mockElement.node.style.opacity).toBe("0");
    expect(mockElement.node.style.transform).toBe("translateX(0%)");

    // 1% scroll
    setStylesForKeyframes(mockElement, 0.01);
    expect(mockElement.node.style.opacity).toBe("0.02");
    expect(mockElement.node.style.transform).toBe("translateX(1%)");

    // 20% scroll
    setStylesForKeyframes(mockElement, 0.2);
    expect(mockElement.node.style.opacity).toBe("0.4");
    expect(mockElement.node.style.transform).toBe("translateX(20%)");

    // 49% scroll
    setStylesForKeyframes(mockElement, 0.49);
    expect(mockElement.node.style.opacity).toBe("0.98");
    expect(mockElement.node.style.transform).toBe("translateX(49%)");

    // 50% scroll
    setStylesForKeyframes(mockElement, 0.5);
    expect(mockElement.node.style.opacity).toBe("1");
    expect(mockElement.node.style.transform).toBe("translateX(50%)");

    // 80% scroll
    setStylesForKeyframes(mockElement, 0.8);
    expect(mockElement.node.style.opacity).toBe("1");
    expect(mockElement.node.style.transform).toBe("translateX(80%)");

    // 99% scroll
    setStylesForKeyframes(mockElement, 0.99);
    expect(mockElement.node.style.opacity).toBe("1");
    expect(mockElement.node.style.transform).toBe("translateX(99%)");

    // 100% scroll
    setStylesForKeyframes(mockElement, 1);
    expect(mockElement.node.style.opacity).toBe("1");
    expect(mockElement.node.style.transform).toBe("translateX(100%)");

    // Test beyond maximum defined keyframe
    setStylesForKeyframes(mockElement, 1.5);
    expect(mockElement.node.style.opacity).toBe("1"); // Assuming it retains the last keyframe's value
    expect(mockElement.node.style.transform).toBe("translateX(100%)");
  });

  test("should notify when reaching a keyframe while scrolling forward", () => {
    const mockListener = jest.fn();
    setListener(mockListener);
    window.innerHeight = 1000;
    scrollManager.setFullViewHeight(window.innerHeight);

    const mockElement = {
      ...getMockElement("mockElement"),
      previousPoints: { testElement: 0 },
      styles: {
        opacity: [
          { constant: 0.1, template: "{?}", values: [0] },
          { constant: 0.5, template: "{?}", values: [1] },
        ],
      },
    };

    // Scrolling forward to 5%
    setStylesForKeyframes(mockElement, 0.05);
    expect(mockListener).not.toHaveBeenCalled();

    // Scrolling forward to 10%
    setStylesForKeyframes(mockElement, 0.1);
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      checkpoint: 10,
      name: "mockElement",
      stage: PARALLAX_SCROLLER_STAGE.scrollForward,
    });

    // Scrolling forward to 20%
    setStylesForKeyframes(mockElement, 0.2);
    expect(mockListener).toHaveBeenCalledTimes(1);

    // Scrolling forward to 30%
    setStylesForKeyframes(mockElement, 0.3);
    expect(mockListener).toHaveBeenCalledTimes(1);

    // Don't scroll
    setStylesForKeyframes(mockElement, 0.3);
    expect(mockListener).toHaveBeenCalledTimes(1);

    // Scrolling back to 9%
    setStylesForKeyframes(mockElement, 0.09);
    expect(mockListener).toHaveBeenNthCalledWith(2, {
      checkpoint: 10,
      name: "mockElement",
      stage: PARALLAX_SCROLLER_STAGE.scrollBackward,
    });

    // Scrolling forward to 11%
    setStylesForKeyframes(mockElement, 0.11);
    expect(mockListener).toHaveBeenNthCalledWith(3, {
      checkpoint: 10,
      name: "mockElement",
      stage: PARALLAX_SCROLLER_STAGE.scrollForward,
    });

    // Scrolling forward to 50%
    setStylesForKeyframes(mockElement, 0.5);
    expect(mockListener).toHaveBeenNthCalledWith(4, {
      checkpoint: 50,
      name: "mockElement",
      stage: PARALLAX_SCROLLER_STAGE.scrollForward,
    });

    // Scrolling forward to 100%
    setStylesForKeyframes(mockElement, 1);
    expect(mockListener).toHaveBeenCalledTimes(4);

    // Scrolling back to 40%
    setStylesForKeyframes(mockElement, 0.4);
    expect(mockListener).toHaveBeenNthCalledWith(5, {
      checkpoint: 50,
      name: "mockElement",
      stage: PARALLAX_SCROLLER_STAGE.scrollBackward,
    });

    // Scrolling back to 1%
    setStylesForKeyframes(mockElement, 0.01);
    expect(mockListener).toHaveBeenNthCalledWith(6, {
      checkpoint: 10,
      name: "mockElement",
      stage: PARALLAX_SCROLLER_STAGE.scrollBackward,
    });
  });
});
