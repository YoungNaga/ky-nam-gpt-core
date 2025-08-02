// uploadAllMarkdownsToNotion.js
import 'dotenv/config';
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Trang cha

const docsPath = path.join(__dirname, 'docs');
const mdFiles = fs.readdirSync(docsPath).filter(file => file.endsWith('.md'));

function convertToBlocks(content) {
  return content.split('\n').map(line => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: { content: line || ' ' }
      }]
    }
  }));
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

(async () => {
  for (const fileName of mdFiles) {
    const titleText = `📄 ${fileName.replace('.md', '')}`;
    const filePath = path.join(docsPath, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');
    const blocks = convertToBlocks(content);
    const chunks = chunkArray(blocks, 100);

    try {
      // 1. Tìm page có sẵn với cùng tiêu đề
      const search = await notion.search({ query: titleText });
      const existingPage = search.results.find(
        p => p.object === 'page' &&
             p.properties?.title?.t
