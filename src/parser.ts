const regexPropValue = /\s*(@?[\w\-[\]]+)\s*:\s*([^;\n]+?)\s*(?:;|$)/gi;
const regexNumericValue = /[-+]?\d*\.?\d+(e[-+]?\d+)?/gi;

/**
 * @typedef {Object} KeyframeStyles
 * @property {string} - CSS property name
 * @property {string} - CSS property value
 */

/**
 * @typedef {Object} ParsedStyle
 * @property {number} rule CSS property
 * @property {string} template CSS style with numeric values replaced with {?}
 * @property {number[]} values Array of numeric values of CSS style
 */

/**
 * Extract numeric values from CSS styles and replace the with a placeholder.
 * @private
 *
 * @param {KeyframeStyles} prop Key-value object where key is a CSS property and
 * value is its value, i.e:
 *
 * - {transform: 'translate(300px, 0) rotate(10deg)'}
 * - {opacity: '0'}
 * - {display: 'none'}
 *
 * @returns {ParsedStyle} Parsed style object, i.e:
 *
 * - {rule: 'transform', template: 'translate({?}px, {?}) rotate({?}deg)', values: [300, 0, 10]}
 * - {rule: 'opacity', template: '{?}', values: [0]}
 * - {rule: 'display', template: 'none', values: []}
 */
export const parseProp = (prop: Record<string, string>) => {
  const [rule, valueString] = Object.entries(prop)[0] || [];

  if (!rule || !valueString) {
    return { rule: null, template: "", values: [] };
  }

  const values: number[] = [];
  const template = valueString
    .replace(regexNumericValue, (num) => {
      values.push(parseFloat(num));
      return "{?}";
    })
    .trim();

  return { rule, template, values };
};

/**
 * Parse CSS styles, provided by `data-{$percent}p` properties into array of
 * key-value pairs.
 * @private
 *
 * @param {string} attrValue A string with one or multiple styles, separated by
 * semicolon (;), i.e:
 *
 * - transform: translate(300px, 0) rotate(10deg); opacity:0;
 * - display: none;
 *
 *
 * @returns {KeyframeStyles[]} Array of key-values objects where key is a CSS
 * property and value is a value of this property, i.e:
 *
 * - [{transform: 'translate(300px, 0) rotate(10deg)'}, {opacity: '0'}]
 * - [{display: 'none'}]
 */
export const parseKeyframeStyles = (attrValue: string) => {
  const props: Record<string, string>[] = [];
  let matches;

  while ((matches = regexPropValue.exec(attrValue))) {
    const [, prop, value] = matches;
    props.push({ [prop]: value });
  }

  regexPropValue.lastIndex = 0;
  return props;
};
