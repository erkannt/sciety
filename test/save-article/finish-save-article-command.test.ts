import { RouterContext } from '@koa/router';
import * as T from 'fp-ts/Task';
import { ParameterizedContext } from 'koa';
import { finishSaveArticleCommand } from '../../src/save-article/finish-save-article-command';
import { Doi } from '../../src/types/doi';
import { userSavedArticle } from '../../src/types/domain-events';
import { User } from '../../src/types/user';
import { toUserId } from '../../src/types/user-id';

describe('finish-save-article-command', () => {
  describe('when the user has not already saved the article', () => {
    it('commits a UserSavedArticle event', async () => {
      const userId = toUserId('user-id');
      const articleId = new Doi('10.1234/5678');
      const context = ({
        session: {
          command: 'save-article',
          articleId: articleId.value,
        },
        state: {
          user: {
            id: userId,
          },
        },
      } as unknown) as RouterContext<{ user: User }>;

      const getAllEvents = T.of([]);
      const commitEvents = jest.fn().mockImplementation(() => T.of(undefined));

      await finishSaveArticleCommand({ getAllEvents, commitEvents })(context, jest.fn());

      expect(commitEvents).toHaveBeenCalledWith([expect.objectContaining({
        type: 'UserSavedArticle',
        userId,
        articleId,
      })]);
    });
  });

  describe('when the user has already saved the article', () => {
    it('does not commit any events', async () => {
      const userId = toUserId('user-id');
      const articleId = new Doi('10.1234/5678');
      const context = ({
        session: {
          command: 'save-article',
          articleId: articleId.value,
        },
        state: {
          user: {
            id: userId,
          },
        },
      } as unknown) as RouterContext<{ user: User }>;

      const getAllEvents = T.of([
        userSavedArticle(userId, articleId),
      ]);
      const commitEvents = jest.fn().mockImplementation(() => T.of(undefined));

      await finishSaveArticleCommand({ getAllEvents, commitEvents })(context, jest.fn());

      expect(commitEvents).toHaveBeenCalledWith([]);
    });
  });

  describe('after saving', () => {
    it('deletes session parameters', async () => {
      const userId = toUserId('user-id');
      const articleId = new Doi('10.1234/5678');
      const context = ({
        session: {
          command: 'save-article',
          articleId: articleId.value,
        },
        state: {
          user: {
            id: userId,
          },
        },
      } as unknown) as ParameterizedContext;

      await finishSaveArticleCommand({
        commitEvents: () => T.of(undefined),
        getAllEvents: async () => [],
      })(context, jest.fn());

      expect(context.session).toStrictEqual({});
    });
  });
});
