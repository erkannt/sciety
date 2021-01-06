import { URL } from 'url';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { Maybe, Result } from 'true-myth';
import createGetFollowedEditorialCommunitiesFromIds, { GetEditorialCommunity } from './get-followed-editorial-communities-from-ids';
import { getUserDisplayName } from './get-user-display-name';
import createProjectFollowedEditorialCommunityIds, { GetAllEvents } from './project-followed-editorial-community-ids';
import createRenderFollowList from './render-follow-list';
import createRenderFollowToggle, { Follows } from './render-follow-toggle';
import createRenderFollowedEditorialCommunity from './render-followed-editorial-community';
import createRenderHeader, { UserDetails } from './render-header';
import createRenderPage from './render-page';
import EditorialCommunityId from '../types/editorial-community-id';
import { HtmlFragment } from '../types/html-fragment';
import { RenderPageError } from '../types/render-page-error';
import { User } from '../types/user';
import toUserId, { UserId } from '../types/user-id';

type FetchEditorialCommunity = (editorialCommunityId: EditorialCommunityId) => T.Task<Maybe<{
  name: string;
  avatar: URL;
}>>;

type GetUserDetails = (userId: UserId) => TE.TaskEither<'not-found' | 'unavailable', UserDetails>;

type Ports = {
  getEditorialCommunity: FetchEditorialCommunity,
  getAllEvents: GetAllEvents,
  follows: Follows,
  getUserDetails: GetUserDetails,
};

interface Params {
  id?: string;
  user: O.Option<User>;
}

type UserPage = (params: Params) => T.Task<Result<{
  title: string,
  content: HtmlFragment
}, RenderPageError>>;

export default (ports: Ports): UserPage => {
  const getEditorialCommunity: GetEditorialCommunity = (editorialCommunityId) => async () => (
    (await ports.getEditorialCommunity(editorialCommunityId)()).unsafelyUnwrap()
  );

  const renderFollowToggle = createRenderFollowToggle(ports.follows);
  const renderFollowedEditorialCommunity = createRenderFollowedEditorialCommunity(renderFollowToggle);
  const getFollowedEditorialCommunities = createGetFollowedEditorialCommunitiesFromIds(
    createProjectFollowedEditorialCommunityIds(ports.getAllEvents),
    getEditorialCommunity,
  );
  const renderHeader = createRenderHeader(ports.getUserDetails);
  const renderFollowList = createRenderFollowList(
    getFollowedEditorialCommunities,
    renderFollowedEditorialCommunity,
  );
  const renderPage = createRenderPage(
    renderHeader,
    renderFollowList,
    getUserDisplayName(ports.getUserDetails),
  );

  return (params) => {
    const userId = toUserId(params.id ?? '');
    const viewingUserId = pipe(
      params.user,
      O.map((user) => user.id),
    );

    return renderPage(userId, viewingUserId);
  };
};
