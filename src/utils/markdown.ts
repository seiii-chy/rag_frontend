import { marked } from 'marked';
import DOMPurify from 'dompurify'; // 安全过滤

// 配置marked
marked.setOptions({
  breaks: true, // 转换换行符为<br>
  gfm: true,    // 支持GitHub风格的Markdown
  async: false, // 关键设置
});

export function renderMarkdown(content: string): string {
  // 先渲染Markdown再净化HTML
  const cleanContent = content.replace(/^data: /gm, '');
  return DOMPurify.sanitize(marked.parse(content) as string);
}