// Utility type để chuyển đổi kiểu của các trường được chỉ định thành number
type WithNumeric<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? number : T[P]
};

/**
 * Parse các trường được chỉ định thành number và trả về kiểu tương ứng
 * @param obj Object cần parse
 * @param keys Các key cần chuyển thành number
 */
export const parseNumeric = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): WithNumeric<T, K> => {
  const result = { ...obj };

  keys.forEach(key => {
    if (key in result && result[key] !== undefined) {
      const num = Number(result[key]);
      if (!isNaN(num)) {
        result[key] = num as T[K];
      }
    }
  });

  return result as WithNumeric<T, K>;
};