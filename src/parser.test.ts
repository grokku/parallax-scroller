import { parseKeyframeStyles, parseProp } from "./parser.js";

describe("parseKeyframeStyles", () => {
  test("parses single style correctly", () => {
    expect(
      parseKeyframeStyles("transform: translate(300px, 0) rotate(10deg);"),
    ).toEqual([{ transform: "translate(300px, 0) rotate(10deg)" }]);
  });

  test("parses multiple styles correctly", () => {
    expect(
      parseKeyframeStyles(
        "transform: translate(300px, 0) rotate(10deg); opacity:0;",
      ),
    ).toEqual([
      { transform: "translate(300px, 0) rotate(10deg)" },
      { opacity: "0" },
    ]);
  });

  test("handles empty input", () => {
    expect(parseKeyframeStyles("")).toEqual([]);
  });

  test("ignores invalid style formats", () => {
    expect(parseKeyframeStyles("invalidStyle")).toEqual([]);
  });

  test("parses styles with various whitespace and semicolon formats", () => {
    expect(
      parseKeyframeStyles(
        "   transform: translate(300px, 0) rotate(10deg) ; opacity:0;   ",
      ),
    ).toEqual([
      { transform: "translate(300px, 0) rotate(10deg)" },
      { opacity: "0" },
    ]);
  });

  test("parses styles with custom properties (CSS variables)", () => {
    expect(parseKeyframeStyles("--main-bg-color: brown;")).toEqual([
      { "--main-bg-color": "brown" },
    ]);
  });

  test("parses styles with data attributes", () => {
    expect(parseKeyframeStyles("data-custom: 123;")).toEqual([
      { "data-custom": "123" },
    ]);
  });

  test("handles styles with no semicolon at the end", () => {
    expect(parseKeyframeStyles("color: blue")).toEqual([{ color: "blue" }]);
  });

  test("parses styles with multiple semicolons", () => {
    expect(parseKeyframeStyles("font-size: 16px;; color: red;")).toEqual([
      { "font-size": "16px" },
      { color: "red" },
    ]);
  });

  test("ignores empty style declarations", () => {
    expect(parseKeyframeStyles("color: red; ; font-size: 16px;")).toEqual([
      { color: "red" },
      { "font-size": "16px" },
    ]);
  });

  test("parses styles with complex values", () => {
    expect(
      parseKeyframeStyles(
        "background: linear-gradient(to bottom, #33ccff 0%, #ff99cc 100%);",
      ),
    ).toEqual([
      { background: "linear-gradient(to bottom, #33ccff 0%, #ff99cc 100%)" },
    ]);
  });

  test("parses styles with quoted values", () => {
    expect(parseKeyframeStyles('content: "Hello, World!";')).toEqual([
      { content: '"Hello, World!"' },
    ]);
  });

  test("handles input with mixed valid and invalid styles", () => {
    expect(
      parseKeyframeStyles("color: blue; invalid; font-size: 14px;"),
    ).toEqual([{ color: "blue" }, { "font-size": "14px" }]);
  });
});

describe("parseProp", () => {
  test("parses transform property with multiple values", () => {
    expect(
      parseProp({
        transform: "translate(300px, 0) rotate(10deg)",
      }),
    ).toEqual({
      rule: "transform",
      template: "translate({?}px, {?}) rotate({?}deg)",
      values: [300, 0, 10],
    });
  });

  test("parses opacity property with single value", () => {
    expect(parseProp({ opacity: "0.5" })).toEqual({
      rule: "opacity",
      template: "{?}",
      values: [0.5],
    });
  });

  test("handles non-numeric property like display", () => {
    expect(parseProp({ display: "none" })).toEqual({
      rule: "display",
      template: "none",
      values: [],
    });
  });

  test("handles empty input", () => {
    expect(parseProp({})).toEqual({
      rule: null,
      template: "",
      values: [],
    });
  });

  test("parses floating point values correctly", () => {
    expect(parseProp({ fontSize: "1.5em" })).toEqual({
      rule: "fontSize",
      template: "{?}em",
      values: [1.5],
    });
  });

  test("handles negative values correctly", () => {
    expect(parseProp({ margin: "-10px" })).toEqual({
      rule: "margin",
      template: "{?}px",
      values: [-10],
    });
  });

  test("handles zero values correctly", () => {
    expect(parseProp({ padding: "0px" })).toEqual({
      rule: "padding",
      template: "{?}px",
      values: [0],
    });
  });

  test("handles property with multiple instances of the same number", () => {
    expect(
      parseProp({
        boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.5)",
      }),
    ).toEqual({
      rule: "boxShadow",
      template: "{?}px {?}px {?}px {?}px rgba({?}, {?}, {?}, {?})",
      values: [0, 0, 5, 0, 0, 0, 0, 0.5],
    });
  });

  test("handles property with numeric and non-numeric units", () => {
    expect(parseProp({ margin: "5px 10%" })).toEqual({
      rule: "margin",
      template: "{?}px {?}%",
      values: [5, 10],
    });
  });

  test("handles CSS variables", () => {
    expect(parseProp({ width: "var(--custom-width)" })).toEqual({
      rule: "width",
      template: "var(--custom-width)",
      values: [],
    });
  });

  test("handles CSS functions other than translate and rotate", () => {
    expect(parseProp({ background: "rgba(255, 0, 0, 0.3)" })).toEqual({
      rule: "background",
      template: "rgba({?}, {?}, {?}, {?})",
      values: [255, 0, 0, 0.3],
    });
  });

  test("handles extremely small floating point numbers", () => {
    expect(parseProp({ zoom: "0.0001" })).toEqual({
      rule: "zoom",
      template: "{?}",
      values: [0.0001],
    });
  });

  test("handles scientific notation numbers", () => {
    expect(parseProp({ scale: "1e3" })).toEqual({
      rule: "scale",
      template: "{?}",
      values: [1000],
    });
  });

  test("handles property values containing whitespace", () => {
    expect(parseProp({ margin: " 5px " })).toEqual({
      rule: "margin",
      template: "{?}px",
      values: [5],
    });
  });

  test("handles non-standard property names", () => {
    expect(parseProp({ "x-custom-property": "10px" })).toEqual({
      rule: "x-custom-property",
      template: "{?}px",
      values: [10],
    });
  });

  test("handles property values in different languages", () => {
    expect(parseProp({ fontFamily: "宋体" })).toEqual({
      rule: "fontFamily",
      template: "宋体",
      values: [],
    });
  });
});
