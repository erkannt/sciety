import { Middleware } from 'koa';
import { CommitEvents, followCommand, GetFollowList } from './follow-command';
import { GroupId } from '../types/group-id';

type Ports = {
  commitEvents: CommitEvents,
  getFollowList: GetFollowList,
};

export const finishFollowCommand = (ports: Ports): Middleware => {
  const command = followCommand(
    ports.getFollowList,
    ports.commitEvents,
  );
  return async (context, next) => {
    if (context.session.command === 'follow' && context.session.editorialCommunityId) {
      const editorialCommunityId = new GroupId(context.session.editorialCommunityId);
      await command(context.state.user, editorialCommunityId);
      delete context.session.command;
      delete context.session.editorialCommunityId;
    }

    await next();
  };
};
