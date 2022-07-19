import * as path from 'path';
import * as fs from 'fs';
import { Parser, Renderer, HtmlRenderer } from 'commonmark';

(async () => {
  const reader = new Parser();
  const writer = new Renderer();
  const postDirPath = path.resolve(__dirname, '../content/post');
  const files = await fs.promises.readdir(postDirPath);

  for (const fileName of files) {
    // console.log(`
    // ----- ${fileName}`);
    const filePath = path.resolve(postDirPath, fileName);
    const stat = await fs.promises.stat(filePath);
    if (stat.isFile() && fileName === 'hugo-img-qiniu.md') {
      const fsContent = await fs.promises.readFile(filePath, 'utf8');
      const parsed = reader.parse(fsContent);
      const walker = parsed.walker();
      let event;
      let node;

      while ((event = walker.next())) {
        node = event.node;
        if (node.type === 'image') {
          // console.log(node.destination);
          node.destination = 'kakakak';
        }
      }
      const res = writer.render(parsed);
      console.log(res);
    }
  }

  // const writer = new HtmlRenderer();

  // console.log(writer.render(parsed));
})();
