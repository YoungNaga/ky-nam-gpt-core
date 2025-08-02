// utils/markdownToBlocks.js
import { marked } from 'marked';

// Hàm tạo đoạn rich_text an toàn từ plain text
function createText(content = '') {
  return [{
    type: 'text',
    text: { content: content || ' ' }
  }];
}

export function markdownToBlocks(mdText) {
  const tokens = marked.lexer(mdText);
  const blocks = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const level = Math.min(token.depth, 3);
        blocks.push({
          object: 'block',
          type: `heading_${level}`,
          [`heading_${level}`]: {
            rich_text: createText(token.text)
          }
        });
        break;
      }

      case 'paragraph':
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: createText(token.text)
          }
        });
        break;

      case 'list': {
        for (const item of token.items) {
          const type = token.ordered ? 'numbered_list_item' : 'bulleted_list_item';
          blocks.push({
            object: 'block',
            type,
            [type]: {
              rich_text: createText(item.text)
            }
          });
        }
        break;
      }

      case 'code':
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: createText(token.text),
            language: token.lang || 'plain text'
          }
        });
        break;

      case 'blockquote':
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: createText(token.text)
          }
        });
        break;

      case 'hr':
        blocks.push({
          object: 'block',
          type: 'divider',
          divider: {}
        });
        break;

      case 'space':
      case 'text': // fallback để giữ layout
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: createText(token.text)
          }
        });
        break;

      default:
        // Bo qua những loại không hỗ trợ
        break;
    }
  }

  return blocks;
}
