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
      text: { content: line || ' ' } // nếu dòng trống thì truyền dấu cách
    }]
  }
}));

// Hàm chia mảng thành nhiều chunk
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Upload
(async () => {
  try {
    // Bước 1: tạo page mới với title
    const createdPage = await notion.pages.create({
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
      }
    });

    console.log('✅ Page created:', createdPage.id);

    // Bước 2: chia block thành các chunk nhỏ và append dần
    const chunks = chunkArray(paragraphs, 100);
    for (const chunk of chunks) {
      await notion.blocks.children.append({
        block_id: createdPage.id,
        children: chunk
      });
      console.log(`✅ Uploaded chunk of ${chunk.length} blocks`);
    }

    console.log('🎉 Upload hoàn tất!');
  } catch (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
})();
