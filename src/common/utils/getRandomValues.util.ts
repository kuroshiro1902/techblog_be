export const getRandomValues = <T = any>(values: T[], count = 1): T[] => {
  if (values.length === 0) {
    throw new Error('Array cannot be empty.');
  }

  // Đảm bảo số lượng phần tử cần lấy không vượt quá độ dài của mảng
  const effectiveCount = Math.min(count, values.length);

  // Sao chép mảng và trộn ngẫu nhiên các phần tử
  const shuffledValues = [...values].sort(() => 0.5 - Math.random());

  // Lấy ra số lượng phần tử yêu cầu
  return shuffledValues.slice(0, effectiveCount);
};
