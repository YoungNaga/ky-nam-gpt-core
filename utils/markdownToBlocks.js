// utils/markdownToBlocks.js
import { marked } from 'marked';

export function markdownToBlocks(mdText) {
  const tokens = marked.lexer(mdText);
  const blocks = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        blocks.push({
          object: 'block',
          type: `heading_${Math.min(token.depth, 3)}`,
          [`heading_${Math.min(token.depth, 3)}`]: {
            rich_text: [{
              type: 'text',
              text: { content: token.text }
            }]
          }
        });
        break;

      case 'paragraph':
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: token.text }
            }]
          }
        });
        break;

      case 'list':
        for (const item of token.items) {
          blocks.push({
            object: 'block',
            type: token.ordered ? 'numbered_list_item' : 'bulleted_list_item',
            [token.ordered ? 'numbered_list_item' : 'bulleted_list_item']: {
              rich_text: [{
                type: 'text',
                text: { content: item.text }
              }]
            }
          });
        }
        break;

      case 'code':
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{
              type: 'text',
              text: { content: token.text }
            }],
            language: token.lang || 'plain text'
          }
        });
        break;

      case 'blockquote':
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{
              type: 'text',
              text: { content: token.text }
            }]
          }
        });
        break;

      case 'hr':
        blocks.push({ object: 'block', type: 'divider', divider: {} });
        break;

      default:
        break;
    }
  }

  return blocks;
}
