import { Logger } from "@/common/utils/logger.util";
import { TEXT_AI } from "../generative";
import { removeHtml } from "@/common/utils/removeHtml.util";

export const summaryContent = async (content: string) => {
  const cleanContent = removeHtml(content);

  const instruction = "Bạn là một trợ lý kiểm duyệt và tóm tắt nội dung bài viết trên nền tảng chia sẻ kiến thức về công nghệ bằng tiếng Việt.";
  const prompt =
    "Nếu nội dung sau là nội dung bạo lực, xúc phạm, kì thị hay không phù hợp thì chỉ trả về chuỗi 'HARMFUL_CONTENT'."
    + 'Nếu không hãy tóm tắt nội dung bài viết trong khoảng dưới 300 từ, đầy đủ ý chính, chỉ có text, không có bất kì định dạng nào khác (html, markdown, ...): '
    + cleanContent;

  const summary = await TEXT_AI(prompt, instruction);
  if (summary?.toUpperCase().includes('HARMFUL_CONTENT')) {
    Logger.error('Nội dung bài viết vi phạm quy định! Vui liệu kiểm tra lại.');
    throw new Error('Nội dung bài viết vi phạm quy định! Vui lòng kiểm tra lại.');
  };
  return summary;
} 