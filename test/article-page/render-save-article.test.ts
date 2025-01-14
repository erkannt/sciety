import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import { constant } from 'fp-ts/function';
import { renderSaveArticle } from '../../src/article-page/render-save-article';
import { Doi } from '../../src/types/doi';
import { toUserId } from '../../src/types/user-id';

describe('render-save-article', () => {
  describe('not logged in', () => {
    it('renders save-to-your-list-form', async () => {
      const projection = jest.fn().mockImplementation(constant(T.of(false)));
      const rendered = await renderSaveArticle(new Doi('10.1111/foobar'), O.none)(projection)();

      expect(rendered).toContain('Save to my list');
      expect(projection).not.toHaveBeenCalled();
    });
  });

  describe('logged in and article is saved', () => {
    it('renders is-saved-link', async () => {
      const projection = constant(T.of(true));
      const rendered = await renderSaveArticle(new Doi('10.1111/foobar'), O.some(toUserId('user')))(projection)();

      expect(rendered).toContain('Saved to my list');
    });
  });

  describe('logged in and article is not saved', () => {
    it('renders save-to-your-list-form', async () => {
      const projection = constant(T.of(false));
      const rendered = await renderSaveArticle(new Doi('10.1111/foobar'), O.some(toUserId('user')))(projection)();

      expect(rendered).toContain('Save to my list');
    });
  });
});
