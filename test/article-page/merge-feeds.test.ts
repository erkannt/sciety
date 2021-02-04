import { URL } from 'url';
import * as T from 'fp-ts/Task';
import { Feed } from '../../src/article-page/get-feed-events-content';
import { mergeFeeds } from '../../src/article-page/merge-feeds';
import { Doi } from '../../src/types/doi';
import { EditorialCommunityId } from '../../src/types/editorial-community-id';

describe('compose-feed-events', () => {
  it('merges feed event lists', async () => {
    const feed1: Feed = () => T.of([
      {
        type: 'review',
        editorialCommunityId: new EditorialCommunityId('communityId'),
        reviewId: new Doi('10.1234/5678'),
        occurredAt: new Date('2020-09-10'),
      },
    ]);
    const feed2: Feed = () => T.of([
      {
        type: 'article-version',
        source: new URL('https://www.biorxiv.org/content/10.1101/2020.09.02.278911v2'),
        occurredAt: new Date('2020-09-24'),
        version: 2,
      },
      {
        type: 'article-version',
        source: new URL('https://www.biorxiv.org/content/10.1101/2020.09.02.278911v1'),
        occurredAt: new Date('2020-09-03'),
        version: 1,
      },
    ]);

    const composite = mergeFeeds([feed1, feed2]);

    const feedEvents = await composite(new Doi('10.1101/2020.09.02.278911'))();

    expect(feedEvents[0]).toMatchObject({
      type: 'article-version',
      version: 2,
    });
    expect(feedEvents[1]).toMatchObject({
      type: 'review',
    });
    expect(feedEvents[2]).toMatchObject({
      type: 'article-version',
      version: 1,
    });
  });
});