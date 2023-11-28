import {
  calculatePageScrollPercent,
  debounce,
  interpolate,
  substituteStyleValue,
} from "./utils";

describe("debounce", () => {
  jest.useFakeTimers();
  let func: jest.Mock;
  let debouncedFunc: (args?: unknown) => unknown;

  beforeEach(() => {
    func = jest.fn();
    debouncedFunc = debounce(func, 1000); // 1000 ms for debounce period
  });

  test("executes the function just once", () => {
    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    jest.runAllTimers();

    expect(func).toHaveBeenCalledTimes(1);
  });

  test("executes the function after the specified time", () => {
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test("executes the function with the latest arguments", () => {
    debouncedFunc(1);
    debouncedFunc(2);
    debouncedFunc(3);

    jest.runAllTimers();

    expect(func).toHaveBeenCalledWith(3);
  });
});

describe("interpolate", () => {
  test("should interpolate correctly", () => {
    expect(interpolate(0, 10, 0.5)).toBe(5);
  });
});

describe("substituteStyleValue", () => {
  test("should replace multiple placeholders correctly", () => {
    expect(substituteStyleValue("translate({?}px, {?}px)", [100, 200])).toBe(
      "translate(100px, 200px)",
    );
  });

  test("should return the original string if there are no placeholders", () => {
    expect(substituteStyleValue("translateX(100px)", [200])).toBe(
      "translateX(100px)",
    );
  });

  test("should ignore extra values if there are more values than placeholders", () => {
    expect(substituteStyleValue("translateX({?}px)", [100, 200])).toBe(
      "translateX(100px)",
    );
  });

  test("should leave placeholders unchanged if there are not enough values", () => {
    expect(substituteStyleValue("translate({?}px, {?}px)", [100])).toBe(
      "translate(100px, {?}px)",
    );
  });

  test("should return an empty string if the template is empty", () => {
    expect(substituteStyleValue("", [100, 200])).toBe("");
  });
});

describe("calculatePageScrollPercent", () => {
  test("should calculate the correct scroll percentage", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 500,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 250,
    });

    expect(calculatePageScrollPercent()).toBe(0.5); // Assuming the scroll is at 50%
  });

  test("should return 0 when the page is not scrolled", () => {
    Object.defineProperty(window, "scrollY", { value: 0 });

    expect(calculatePageScrollPercent()).toBe(0);
  });

  test("should return 1 (or close to 1) when the page is fully scrolled", () => {
    Object.defineProperty(window, "scrollY", {
      value: 500,
    });

    expect(calculatePageScrollPercent()).toBeCloseTo(1, 1);
  });

  test("should calculate correctly for different document heights", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
    });
    Object.defineProperty(window, "scrollY", {
      value: 1000,
    });

    expect(calculatePageScrollPercent()).toBeCloseTo(0.666, 2);
  });

  test("should handle cases where no scrolling is possible", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 500,
    });

    expect(calculatePageScrollPercent()).toBe(0);
  });
});
