import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { articleSearchPage } from '../../src/article-search-page';
import { createTestServer } from '../http/server';

describe('create render page', () => {
  it('displays search results', async () => {
    const { adapters } = await createTestServer();
    const renderPage = articleSearchPage(adapters);
    const params = { query: '10.1101/833392' };

    const content = await pipe(
      renderPage(params),
      TE.map((page) => page.content),
    )();

    expect(content).toStrictEqual(E.right(expect.stringContaining('Search results')));
  });
});
