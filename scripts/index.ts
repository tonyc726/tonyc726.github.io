import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const postDirPath = path.resolve(__dirname, '../content/post');
  const files = await fs.promises.readdir(postDirPath);

  for (const fileName of files) {
    // console.log(`
    // ----- ${fileName}`);
    const filePath = path.resolve(postDirPath, fileName);
    const stat = await fs.promises.stat(filePath);
    if (stat.isFile() && fileName === 'hugo-img-qiniu.md') {
      const fsContent = await fs.promises.readFile(filePath, 'utf8');
      const tree = unified().use(remarkParse).parse(fsContent);
      console.log(tree);
      const markdownContent = unified().use(remarkStringify).stringify(tree);
      console.log(markdownContent);
    }
  }
})();
