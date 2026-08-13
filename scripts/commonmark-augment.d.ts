import type { Node } from 'commonmark';

declare module 'commonmark' {
  /** Base renderer exported by commonmark 0.31; missing from @types/commonmark. */
  export class Renderer {
    public render(node: Node): string;
  }
}
