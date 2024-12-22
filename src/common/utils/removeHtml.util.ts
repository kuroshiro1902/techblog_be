import { JSDOM } from 'jsdom';

type HTMLContent = string;

export const removeHtml = (html: HTMLContent): string => {
  // Sử dụng JSDOM để parse HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Loại bỏ các thẻ script và style
  document.querySelectorAll('script, style, head, img').forEach(el => el.remove());

  // Lấy text content và loại bỏ khoảng trắng thừa
  return document.body.textContent?.trim()
    .replace(/\s+/g, ' ') // Thay nhiều khoảng trắng bằng 1 khoảng trắng
    .replace(/\n+/g, '\n') // Thay nhiều dòng trống bằng 1 dòng trống
    || '';
};