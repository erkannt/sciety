import { reviewResponse } from '../../src/respond/review-response';
import { Doi } from '../../src/types/doi';
import {
  userFoundReviewHelpful,
  userFoundReviewNotHelpful,
  userRevokedFindingReviewHelpful,
  userRevokedFindingReviewNotHelpful,
} from '../../src/types/domain-events';
import { toUserId } from '../../src/types/user-id';

describe('review-response', () => {
  const userId = toUserId('currentUser');
  const reviewId = new Doi('10.1101/currentReview');

  it.each([
    ['no events', [], 'none'],
    ['event for other review', [
      userFoundReviewHelpful(userId, new Doi('10.1101/otherReview')),
    ], 'none'],
    ['helpful', [
      userFoundReviewHelpful(userId, reviewId),
    ], 'helpful'],
    ['not-helpful', [
      userFoundReviewNotHelpful(userId, reviewId),
    ], 'not-helpful'],
    ['helpful event from other user', [
      userFoundReviewHelpful(toUserId('otherUser'), reviewId),
    ], 'none'],
    ['not-helpful event from other user', [
      userFoundReviewNotHelpful(toUserId('otherUser'), reviewId),
    ], 'none'],
    ['helpful, revoked helpful', [
      userFoundReviewHelpful(userId, reviewId),
      userRevokedFindingReviewHelpful(userId, reviewId),
    ], 'none'],
    ['not-helpful, revoked not-helpful', [
      userFoundReviewNotHelpful(userId, reviewId),
      userRevokedFindingReviewNotHelpful(userId, reviewId),
    ], 'none'],
    ['helpful, revoked helpful, helpful', [
      userFoundReviewHelpful(userId, reviewId),
      userRevokedFindingReviewHelpful(userId, reviewId),
      userFoundReviewHelpful(userId, reviewId),
    ], 'helpful'],
    ['helpful, revoked helpful, not-helpful', [
      userFoundReviewHelpful(userId, reviewId),
      userRevokedFindingReviewHelpful(userId, reviewId),
      userFoundReviewNotHelpful(userId, reviewId),
    ], 'not-helpful'],
    ['not-helpful, revoked not-helpful, helpful', [
      userFoundReviewNotHelpful(userId, reviewId),
      userRevokedFindingReviewNotHelpful(userId, reviewId),
      userFoundReviewHelpful(userId, reviewId),
    ], 'helpful'],
  ])('given %s', (_, events, expected) => {
    expect(reviewResponse(userId, reviewId)(events)).toStrictEqual(expected);
  });
});
