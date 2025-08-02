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
    console.log('📄 Page to update:', NOTION_PAGE_ID);

    // Bước 1: Lấy danh sách block cũ để xóa
    const oldBlocks = await notion.blocks.children.list({
      block_id: NOTION_PAGE_ID,
    });

    console.log(`🧹 Đang xoá ${oldBlocks.results.length} block cũ...`);
    for (const block of oldBlocks.results) {
      try {
        await notion.blocks.delete({ block_id: block.id });
        console.log(`🗑️ Deleted block: ${block.id}`);
      } catch (err) {
        console.warn(`⚠️ Không xoá được block ${block.id} (có thể không do API tạo): ${err.message}`);
      }
    }

    // Bước 2: Chia và append nội dung mới
    const chunks = chunkArray(paragraphs, 100);
    let count = 1;
    for (const chunk of chunks) {
      await notion.blocks.children.append({
        block_id: NOTION_PAGE_ID,
        children: chunk
      });
      console.log(`➡️ Chunk ${count++}/${chunks.length} uploaded.`);
    }

    console.log('🎉 All content uploaded successfully!');
  } catch (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
})();
