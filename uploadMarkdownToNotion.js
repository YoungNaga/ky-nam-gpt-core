// uploadMarkdownToNotion.js
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');

// Init Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Setup IDs
const databaseId = process.env.NOTION_DATABASE_ID; // optional, nếu dùng database
const parentPageId = process.env.NOTION_PAGE_ID;

// Read .md file
const markdownContent = fs.readFileSync('00_KyNamGPT_Whitepaper.md', 'utf-8');

// Convert markdown to paragraphs (simple version)
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

// Push to Notion
(async () => {
  try {
    const response = await notion.pages.create({
      parent: { page_id: parentPageId },
      properties: {
        title: [
          {
            text: {
              content: "✅ Kỳ Nam GPT Whitepaper"
            }
          }
        ]
      },
      children: paragraphs
    });
    console.log('✅ Page created in Notion:', response.id);
  } catch (error) {
    console.error('❌ Error creating page:', error);
  }
})();
