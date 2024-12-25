import { TEXT_AI } from "../generative";
import { removeHtml } from "@/common/utils/removeHtml.util";

export const summaryContent = (content: string) => {
  const cleanContent = removeHtml(content);

  const instruction = "Bạn là một trợ lý tóm tắt nội dung bài viết trên nền tảng chia sẻ kiến thức về công nghệ bằng tiếng Việt.";
  const prompt = 'Hãy tóm tắt nội dung bài viết sau trong khoảng dưới 400 chữ, chỉ có text, không có bất kì định dạng nào khác (html, markdown, ...): ' + cleanContent;

  const summary = TEXT_AI(prompt, instruction);
  return summary;
} 