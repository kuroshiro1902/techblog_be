import { Logger } from "@/common/utils/logger.util";
import { TEXT_AI } from "@/openai/generative";
import { removeHtml } from "@/common/utils/removeHtml.util";

export const analyzeCommentSentiment = async (content: string): Promise<number> => {
  try {
    const result = await TEXT_AI(
      removeHtml(content),
      "Bạn là một trợ lý đánh giá sắc thái bình luận của người dùng trên trang web bài viết về công nghệ."
      + " Hãy đánh giá sắc thái bình luận và trả về kết quả là:"
      + " NEG (Nếu người dùng thể hiện sự không thích bài viết),"
      + " NEU (Nếu người dùng có sự trung tính),"
      + " POS (Nếu người dùng thể hiện sự thích bài viết).",
      { temperature: 0.3 }
    );

    return result.includes("NEG") ? -1 : result.includes("POS") ? 1 : 0;
  } catch (error) {
    await Logger.error('Error analyzing comment sentiment: ' + error);
    console.log('Error analyzing comment sentiment: ' + error);
    return 0; // Mặc định là trung tính nếu có lỗi
  }
}; 