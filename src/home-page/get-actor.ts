import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import { flow, pipe } from 'fp-ts/function';
import { GroupId } from '../types/group-id';

type Actor = {
  url: string,
  name: string,
  imageUrl: string,
};

type GetActor = (id: GroupId) => T.Task<Actor>;

export type GetGroup = (editorialCommunityId: GroupId) => T.Task<O.Option<{
  name: string,
  avatarPath: string,
}>>;

export const getActor = (getGroup: GetGroup): GetActor => (id) => pipe(
  id,
  getGroup,
  T.map(flow(
    O.getOrElseW(() => { throw new Error(`No such group ${id.value}`); }),
    (group) => ({
      name: group.name,
      imageUrl: group.avatarPath,
      url: `/groups/${id.value}`,
    }),
  )),
);
