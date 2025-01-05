import { removeHtml } from "@/common/utils/removeHtml.util";
import { DB } from "@/database/database";
import { TEXT_AI } from "../generative";
import { Logger } from "@/common/utils/logger.util";
import { categoryNameCache } from "@/cache/category.cache";

/**
 * Phân loại bài viết dựa trên nội dung
 * @param content Nội dung hoặc mô tả bài viết
 * @returns Danh sách các thể loại phân loại
 */
export const categorizePost = async (content: string): Promise<string[]> => {
  // Kiểm tra và tải các thể loại hiện có từ cơ sở dữ liệu nếu cache rỗng
  if (categoryNameCache.size === 0) {
    const dbCategories = await DB.category.findMany({ select: { name: true } });
    dbCategories.forEach((category) => categoryNameCache.add(category.name));
  }

  // Chuẩn bị dữ liệu đầu vào cho AI
  const existedCategoriesText = Array.from(categoryNameCache).join(", ");
  const prompt = `
    Hãy phân loại nội dung sau: ${removeHtml(content)}\n
    - Các thể loại có sẵn: ${existedCategoriesText}.\n
    - Bạn có thể tạo thể loại mới nếu nội dung không phù hợp với bất kì thể loại nào có sẵn.\n
    - Phân loại tối đa: 1 đến 3 thể loại.\n
    - Chỉ trả về một chuỗi duy nhất gồm các thể loại dưới dạng capitalization, cách nhau bằng dấu phẩy, không chứa bất kỳ kí tự nào khác.
    Ví dụ: Thể loại 1, Thể loại 2
  `;
  const instruction = "Bạn là một trợ lý phân loại nội dung trên trang web bài viết về công nghệ.";

  try {
    // Gửi yêu cầu đến AI và xử lý kết quả trả về
    const res = await TEXT_AI(prompt, instruction, { temperature: 0.75 });
    const categories = res?.split(',').map((c) => c.trim()).filter((c) => c.length > 0);

    setImmediate(async () => {
      // Cập nhật cache với các thể loại mới
      categories?.forEach((category) => {
        if (!categoryNameCache.has(category)) {
          categoryNameCache.add(category);
        }
      });
    })

    return categories ?? [];
  } catch (error) {
    Logger.error('Error categorizing post: ' + error);
    return [];
  }
};
