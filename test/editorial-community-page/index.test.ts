import * as O from 'fp-ts/lib/Option';
import buildRenderPage, { Params } from '../../src/editorial-community-page';
import createServer from '../http/server';

describe('create render page', (): void => {
  describe('when the editorial community does not exist', (): void => {
    it('throws a NotFound error', async (): Promise<void> => {
      const { adapters } = await createServer();
      const renderPage = buildRenderPage(adapters);
      const params: Params = { id: 'no-such-community', user: O.none };
      const result = await renderPage(params)();

      expect(result.unsafelyUnwrapErr().type).toStrictEqual('not-found');
    });
  });
});
