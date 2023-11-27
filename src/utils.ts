const regexInterpolateString = /\{\?\}/;

/**
 * Debounce function.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calculate page percent scrolled.
 * @private
 */
export const calculatePageScrollPercent = () => {
  const documentElement = document.documentElement || document.body;
  const height = documentElement.scrollHeight - documentElement.clientHeight;
  return height > 0
    ? (window.scrollY || documentElement.scrollTop) / height
    : 0;
};

/**
 * Calculate CSS value delta based on scroll percentage and add it to initial
 * @private
 *
 * @param {number} from Starting value from `data-{$percent}p` property
 * @param {number} to Ending value from next `data-{$percent}p` property
 * @param {number} progress Relative scroll percentage between "from" and "to"
 *
 * @returns {number} Current CSS value, relative to the "from" point
 */
export const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

/**
 * Replace placeholders in CSS styled with interpolated values, based on
 * relative percentage scrolled between keyframes.
 * @private
 *
 * @param {string} template CSS value with placeholders, i.e:
 *
 * -translate({?}px, {?}px)
 *
 * @param {number[]} values Array of values for current scroll position, i. e:
 *
 * - [204.5324427480916, -68.17748091603053]
 *
 * @returns {string} Valid CSS value, i.e:
 *
 * - translate(204.5324427480916px, -68.17748091603053px)
 */
export const substituteStyleValue = (template: string, values: Array<number>) =>
  values.reduce(
    (placeholder, value) =>
      placeholder.replace(regexInterpolateString, value.toString()),
    template
  );
