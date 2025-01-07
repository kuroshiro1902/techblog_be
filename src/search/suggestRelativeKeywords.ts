import { TEXT_AI } from "@/openai/generative";
import { z } from "zod";

type CacheEntry = {
  data: string[]; // Dữ liệu từ khóa
  expiry: number; // Thời điểm hết hạn (timestamp)
};

const cache = new Map<string, CacheEntry>(); // Cache với TTL

const DEFAULT_TTL = 60 * 1000;

const instruction =
  "Bạn là một trợ lý gợi ý từ khóa trên một website chia sẻ kiến thức công nghệ. " +
  "Khi người dùng gửi yêu cầu cho bạn, hãy trả về cho người dùng nhiều nhất 5 từ khóa liên quan đến chủ đề mà người dùng yêu cầu, ngăn cách nhau bằng dấu ',', tuyệt đối không trả về thông tin gì khác ngoài các từ khóa. "
  + "Ví dụ: 'Javascript' -> biến trong javascript, bất đồng bộ, nodejs";

export const suggestRelativeKeywords = async (prompt$: string) => {
  const prompt = z.string().trim().max(500).parse(prompt$);

  const cacheKey = prompt.toLowerCase();

  const now = Date.now();

  // Kiểm tra cache
  const cachedEntry = cache.get(cacheKey);
  if (cachedEntry && cachedEntry.expiry > now) {
    console.log("Relative keyword cache hit"); // Debug: In ra khi cache có kết quả hợp lệ
    return cachedEntry.data;
  }

  // Nếu không có cache hợp lệ, gọi API
  const res = await TEXT_AI(prompt, instruction, { temperature: 0.5 });
  const keywords = res?.split(",").map((v) => v.trim());

  if ((keywords?.length ?? 0) > 0) {
    // Lưu vào cache với TTL
    cache.set(cacheKey, {
      data: keywords!,
      expiry: now + DEFAULT_TTL, // Thời điểm hết hạn
    });
  }

  return keywords || [];
};
