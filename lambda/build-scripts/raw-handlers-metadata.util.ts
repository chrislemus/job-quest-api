import path from 'path';
import { readAllFiles } from './read-all-files.util';
import __ from 'lodash';

export type RawHandlersMetadata = {
  [path: string]: { [httpMethod: string]: string };
};

export function getRawHandlersMetaData(rootPath: string) {
  const rawHandlersMetadata: RawHandlersMetadata = {};
  const absolutePath = path.join(rootPath, 'src');

  for (const file of readAllFiles(absolutePath)) {
    if (
      file.endsWith('get.handler.ts') ||
      file.endsWith('post.handler.ts') ||
      file.endsWith('patch.handler.ts') ||
      file.endsWith('put.handler.ts') ||
      file.endsWith('options.handler.ts') ||
      file.endsWith('delete.handler.ts')
    ) {
      const httpMethod = file.split('/').slice(-1)[0].split('.')[0];
      let path: string = '/' + file.split('/').slice(1, -1).join('/');
      path = path.replace(absolutePath, '');
      path = path.endsWith('/') ? path.slice(0, -1) : path;
      const fileFinal = file.replace(absolutePath, '.');
      __.set(rawHandlersMetadata, [path, httpMethod], fileFinal);
    }
  }
  return rawHandlersMetadata;
}
