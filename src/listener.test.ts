import { setListener, notify } from "./listener.js";
import {
  PARALLAX_SCROLLER_STAGE,
  type ParallaxScrollerListenerParams,
} from "./types";

const mockListener = jest.fn();
const mockData: ParallaxScrollerListenerParams = {
  name: "test",
  stage: PARALLAX_SCROLLER_STAGE.init,
};

describe("listener", () => {
  test("should return false if no listener function is set", () => {
    expect(notify(mockData)).toBe(false);
  });

  test("should return false if empty listener function is set", () => {
    setListener();
    expect(notify(mockData)).toBe(false);
  });

  test("should throw an error if a non-function argument is passed", () => {
    expect(() => setListener("not a function" as unknown as jest.Mock)).toThrow(
      "Listener must be a function"
    );
  });

  test("should invoke the listener function with given arguments", () => {
    setListener(mockListener);
    expect(notify(mockData)).toBe(true);
    expect(mockListener).toHaveBeenCalledWith(mockData);
  });
});
