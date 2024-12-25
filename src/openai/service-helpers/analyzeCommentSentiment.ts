import { Logger } from "@/common/utils/logger.util";
import { TEXT_AI } from "@/openai/generative";
import { removeHtml } from "@/common/utils/removeHtml.util";

/**
 * Kiểm tra nội dung bình luận có vi phạm quy định hay không.
 * Nếu vi phạm thì trả về lỗi.
 * Nếu không thì trả về sắc thái bình luận.
 */
export const analyzeCommentSentiment = async (content: string): Promise<number> => {
  try {
    const result = (await TEXT_AI(
      removeHtml(content),
      "Bạn là một trợ lý đánh giá sắc thái bình luận của người dùng trên trang web bài viết về công nghệ."
      + " Hãy đánh giá sắc thái bình luận, nếu bình luận là nội dung bạo lực, xúc phạm, kì thị hay không phù hợp thì trả về 'HARM', "
      + " nếu không thì trả về kết quả như sau:"
      + " NEG (Nếu người dùng thể hiện sự không thích bài viết),"
      + " NEU (Nếu người dùng có sự trung tính hoặc không thích ở mức độ vừa phải),"
      + " POS (Nếu người dùng thể hiện sự thích bài viết).",
      { temperature: 0.3 }
    )).trim();

    console.log({ result });

    if (result.includes("HARM")) {
      throw new Error('Nội dung bình luận vi phạm quy định! Vui lòng kiểm tra lại.');
    }

    return result.includes("NEG") ? -1 : result.includes("POS") ? 1 : 0;
  } catch (error) {
    await Logger.error('Error analyzing comment sentiment: ' + error);
    console.log('Error analyzing comment sentiment: ' + error);
    throw error;
  }
}; 