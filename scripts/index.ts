import * as path from 'path';
import * as fs from 'fs';
import * as unified from 'unified';
import * as remarkParse from 'remark-parse';
import * as remarkStringify from 'remark-stringify';

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
