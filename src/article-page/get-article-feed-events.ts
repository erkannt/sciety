import { URL } from 'url';
import * as T from 'fp-ts/lib/Task';
import { Maybe } from 'true-myth';
import { composeFeedEvents } from './compose-feed-events';
import { getFeedEventsContent, GetReview } from './get-feed-events-content';
import { createHandleArticleVersionErrors } from './handle-article-version-errors';
import { GetFeedItems } from './render-feed';
import { ArticleServer } from '../types/article-server';
import { Doi } from '../types/doi';
import { EditorialCommunityId } from '../types/editorial-community-id';
import { ReviewId } from '../types/review-id';

type FindReviewsForArticleDoi = (articleVersionDoi: Doi) => T.Task<ReadonlyArray<{
  reviewId: ReviewId;
  editorialCommunityId: EditorialCommunityId;
  occurredAt: Date;
}>>;

export type FindVersionsForArticleDoi = (doi: Doi, server: ArticleServer) => Promise<ReadonlyArray<{
  source: URL;
  occurredAt: Date;
  version: number;
}>>;

export const getArticleFeedEvents = (
  findReviewsForArticleDoi: FindReviewsForArticleDoi,
  findVersionsForArticleDoi: FindVersionsForArticleDoi,
  fetchReview: GetReview,
  getEditorialCommunity: (editorialCommunityId: EditorialCommunityId) => T.Task<Maybe<{
    name: string;
    avatar: URL;
  }>>,
): GetFeedItems => (
  async (doi, server) => (
    createHandleArticleVersionErrors(
      getFeedEventsContent(
        composeFeedEvents(
          async () => (await findReviewsForArticleDoi(doi)()).map((review) => ({
            type: 'review',
            ...review,
          })),
          async () => (await findVersionsForArticleDoi(doi, server)).map((version) => ({
            type: 'article-version',
            ...version,
          })),
        ),
        fetchReview,
        async (editorialCommunityId) => ((await getEditorialCommunity(editorialCommunityId)()).unsafelyUnwrap()),
      ),
    )(doi, server)
  )
);
