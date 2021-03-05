import * as fs from 'fs';
import path from 'path';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Logger } from './logger';

type FetchStaticFile = (filename: string) => RTE.ReaderTaskEither<Logger, 'not-found' | 'unavailable', string>;

export const fetchStaticFile: FetchStaticFile = (filename) => (logger) => pipe(
  path.resolve(__dirname, '..', '..', 'static', filename),
  TE.taskify(fs.readFile),
  TE.bimap(
    (error) => {
      logger('error', 'Failed to fetch static file', { error });
      return error.code === 'ENOENT' ? 'not-found' : 'unavailable';
    },
    (text) => text.toString(),
  ),
);
