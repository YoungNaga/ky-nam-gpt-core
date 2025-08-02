require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');

// ✅ Lấy token và page ID từ biến môi trường (đã cấu hình GitHub Secrets)
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID;

// ✅ Khởi tạo Notion client
const notion = new Client({ auth: NOTION_API_KEY });

// ✅ Đọc nội dung file Markdown
const markdownContent = fs.readFileSync('00_KyNamGPT_Whitepaper.md', 'utf-8');

// ✅ Chuyển Markdown thành array block đơn giản
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

// ✅ Gửi nội dung lên Notion
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
