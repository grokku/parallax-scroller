import { loopUpdatePositions } from "./render";
import { type ParallaxScrollerElement } from "./types";
import { setStylesForKeyframes } from "./keyframes";
import { scrollManager } from "./config";

const mockElements: ParallaxScrollerElement[] = [
  {
    name: "mockDiv",
    node: document.createElement("div"),
    styles: {},
  },
  {
    name: "mockSpan",
    node: document.createElement("span"),
    styles: {},
  },
];

jest.mock("./keyframes", () => ({
  setStylesForKeyframes: jest.fn(),
}));

describe("loopUpdatePositions", () => {
  beforeAll(() => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
    });

    jest.mock("./keyframes", () => ({
      setStylesForKeyframes: jest.fn(),
    }));
  });

  beforeEach(() => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(123); // Immediately invoke the callback with a dummy timestamp
        return 123;
      });

    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(clearTimeout);

    jest
      .spyOn(scrollManager, "isActive")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
  });

  afterEach(() => {
    (window.requestAnimationFrame as jest.Mock).mockRestore();
    jest.clearAllMocks();
    scrollManager.setIsActive(false);
  });

  test("requests an animation frame when active", () => {
    loopUpdatePositions(mockElements);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  test("cancels the animation frame when not active", () => {
    loopUpdatePositions(mockElements);
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(123);
  });

  test("should not update positions if isActive is false", () => {
    Object.defineProperty(window, "scrollY", {
      value: 500,
    });

    loopUpdatePositions(mockElements);
    expect(setStylesForKeyframes).toHaveBeenCalledTimes(2);
    expect(setStylesForKeyframes).toHaveBeenNthCalledWith(
      1,
      mockElements[0],
      0.25
    );
    expect(setStylesForKeyframes).toHaveBeenNthCalledWith(
      2,
      mockElements[1],
      0.25
    );
  });

  test("should continuously update positions using requestAnimationFrame", () => {
    Object.defineProperty(window, "scrollY", {
      value: 100,
    });

    loopUpdatePositions(mockElements);

    expect(setStylesForKeyframes).toHaveBeenCalledTimes(2);
    expect(setStylesForKeyframes).toHaveBeenNthCalledWith(
      1,
      mockElements[0],
      0.05
    );
    expect(setStylesForKeyframes).toHaveBeenNthCalledWith(
      2,
      mockElements[1],
      0.05
    );
  });
});
