import { URL } from 'url';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import { pipe } from 'fp-ts/lib/function';
import { Maybe, Result } from 'true-myth';
import { getActor } from './get-actor';
import getMostRecentEvents, { GetAllEvents } from './get-most-recent-events';
import projectIsFollowingSomething from './project-is-following-something';
import createRenderEditorialCommunities, { GetAllEditorialCommunities } from './render-editorial-communities';
import createRenderEditorialCommunity from './render-editorial-community';
import createRenderFeed from './render-feed';
import createRenderFollowToggle from './render-follow-toggle';
import renderPage from './render-page';
import renderPageHeader from './render-page-header';
import renderSearchForm from './render-search-form';
import createRenderSummaryFeedItem from '../shared-components/render-summary-feed-item';
import createRenderSummaryFeedList from '../shared-components/render-summary-feed-list';
import EditorialCommunityId from '../types/editorial-community-id';
import { FetchExternalArticle } from '../types/fetch-external-article';
import { HtmlFragment } from '../types/html-fragment';
import { User } from '../types/user';
import { UserId } from '../types/user-id';

type GetEditorialCommunity = (editorialCommunityId: EditorialCommunityId) => T.Task<Maybe<{
  name: string;
  avatar: URL;
}>>;

interface Ports {
  fetchArticle: FetchExternalArticle;
  getAllEditorialCommunities: GetAllEditorialCommunities;
  getEditorialCommunity: GetEditorialCommunity,
  getAllEvents: GetAllEvents,
  follows: (userId: UserId, editorialCommunityId: EditorialCommunityId) => T.Task<boolean>,
}

interface Params {
  user: O.Option<User>,
}

type HomePage = (params: Params) => T.Task<Result<{
  title: string,
  content: HtmlFragment
}, never>>;

export default (ports: Ports): HomePage => {
  const renderFollowToggle = createRenderFollowToggle(ports.follows);
  const renderEditorialCommunities = createRenderEditorialCommunities(
    ports.getAllEditorialCommunities,
    createRenderEditorialCommunity(renderFollowToggle),
  );
  const renderSummaryFeedItem = createRenderSummaryFeedItem(getActor(ports.getEditorialCommunity), ports.fetchArticle);
  const renderSummaryFeedList = createRenderSummaryFeedList(renderSummaryFeedItem);
  const renderFeed = createRenderFeed(
    projectIsFollowingSomething(ports.getAllEvents),
    getMostRecentEvents(ports.getAllEvents, ports.follows, 20),
    renderSummaryFeedList,
  );

  return (params) => pipe(
    params.user,
    O.map((user) => user.id),
    renderPage(renderPageHeader, renderEditorialCommunities, renderSearchForm, renderFeed),
  );
};
