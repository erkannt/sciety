import * as T from 'fp-ts/lib/Task';
import Doi from '../../src/types/doi';
import toUserId from '../../src/types/user-id';
import { GetAllEvents, projectSavedArticleDois } from '../../src/user-page/project-saved-article-dois';

describe('project-saved-article-dois', () => {
  describe('when the user has saved articles', () => {
    it('returns the DOIs of the saved articles', async () => {
      const userId = toUserId('1295307136415735808');
      const expected = [
        new Doi('10.1101/67890'),
        new Doi('10.1101/12345'),
      ];

      const getAllEvents: GetAllEvents = T.of([
        {
          type: 'UserSavedArticle',
          date: new Date('2020-01-01'),
          articleId: new Doi('10.1101/12345'),
          userId,
        },
        {
          type: 'UserSavedArticle',
          date: new Date('2020-01-02'),
          articleId: new Doi('10.1101/67890'),
          userId,
        },
      ]);

      const output = await projectSavedArticleDois(getAllEvents)(userId)();

      expect(output).toStrictEqual(expected);
    });
  });

  describe('when another user has saved articles and the current user has not', () => {
    it('returns an empty array', async () => {
      const getAllEvents: GetAllEvents = T.of([
        {
          type: 'UserSavedArticle',
          date: new Date('2020-01-02'),
          articleId: new Doi('10.1101/67890'),
          userId: toUserId('another-user'),
        },
      ]);

      const output = await projectSavedArticleDois(getAllEvents)(toUserId('the-current-user'))();

      expect(output).toHaveLength(0);
    });
  });

  describe('when the user has not saved articles', () => {
    it('returns an empty array', async () => {
      const getAllEvents: GetAllEvents = T.of([]);

      const output = await projectSavedArticleDois(getAllEvents)(toUserId('some-user'))();

      expect(output).toHaveLength(0);
    });
  });
});