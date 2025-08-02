import 'dotenv/config';
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Trick để lấy đúng đường dẫn file trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lấy biến môi trường
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID;

// Init client
const notion = new Client({ auth: NOTION_API_KEY });

// Đọc Markdown
const markdownContent = fs.readFileSync(path.join(__dirname, '00_KyNamGPT_Whitepaper.md'), 'utf-8');

// Chuyển thành block
const paragraphs = markdownContent.split('\n').map(line => ({
  object: 'block',
  type: 'paragraph',
  paragraph: {
    rich_text: [{
      type: 'text',
      text: { content: line }
    }]
  }
}));

// Upload
(async () => {
  try {
    const response = await notion.pages.create({
      parent: { page_id: NOTION_PAGE_ID },
      properties: {
        title: {
          title: [
            {
              type: "text",
              text: {
                content: "✅ Kỳ Nam GPT Whitepaper"
              }
            }
          ]
        }
      },
      children: paragraphs
    });
    console.log('✅ Page created in Notion:', response.id);
  } catch (error) {
    console.error('❌ Error creating page:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
})();
