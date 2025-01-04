/**
 *
 * @param ms default: 500ms.
 * @returns
 */
export function delay(ms = 500) {
  console.log(`wait ${ms}ms`);

  return new Promise((resolve) => setTimeout(resolve, ms));
}
