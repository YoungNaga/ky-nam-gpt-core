// uploadAllMarkdownsToNotion.js
import 'dotenv/config';
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { markdownToBlocks } from './utils/markdownToBlocks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

const docsPath = path.join(__dirname, 'docs');
const mdFiles = fs.readdirSync(docsPath).filter(file => file.endsWith('.md'));

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
    const blocks = markdownToBlocks(content);
    const chunks = chunkArray(blocks, 100);

    try {
      const search = await notion.search({ query: titleText });
      const existingPage = search.results.find(
        p => p.object === 'page' &&
             p.properties?.title?.title?.[0]?.text?.content === titleText
      );

      let pageId = null;
      if (existingPage) {
        pageId = existingPage.id;
        console.log(`🔁 Found existing page: ${titleText}`);

        const children = await notion.blocks.children.list({ block_id: pageId });
        for (const child of children.results) {
          await notion.blocks.delete({ block_id: child.id }).catch(() => {});
        }
      } else {
        const createdPage = await notion.pages.create({
          parent: { page_id: PARENT_PAGE_ID },
          properties: {
            title: {
              title: [
                {
                  type: 'text',
                  text: { content: titleText }
                }
              ]
            }
          }
        });
        pageId = createdPage.id;
        console.log(`✅ Created new page: ${titleText}`);
      }

      for (const chunk of chunks) {
        await notion.blocks.children.append({
          block_id: pageId,
          children: chunk
        });
      }

      console.log(`🚀 Synced: ${fileName}`);
    } catch (error) {
      console.error(`❌ Error with ${fileName}:`, error.message);
    }
  }

  console.log('🎉 All Markdown files uploaded or updated!');
})();
