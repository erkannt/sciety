import { FollowList } from '../../src/types/follow-list';
import { GroupId } from '../../src/types/group-id';
import { toUserId } from '../../src/types/user-id';

describe('follow-list', () => {
  const userId1 = toUserId('u1');
  const editorialCommunity1Id = new GroupId('id1');

  describe('follow', () => {
    describe('when the community to be followed is not currently followed', () => {
      it('follows the community', () => {
        const list = new FollowList(userId1);

        const events = list.follow(editorialCommunity1Id);

        expect(events).toHaveLength(1);
        expect(events[0].editorialCommunityId).toBe(editorialCommunity1Id);
      });
    });

    describe('when the community to be followed is already followed', () => {
      it('leaves the list unchanged', () => {
        const list = new FollowList(userId1);

        list.follow(editorialCommunity1Id);
        const events = list.follow(new GroupId(editorialCommunity1Id.value));

        expect(events).toHaveLength(0);
      });
    });
  });

  describe('unfollow', () => {
    describe('when the community to be unfollowed is currently followed', () => {
      it('unfollows the community', async () => {
        const list = new FollowList(userId1);
        list.follow(editorialCommunity1Id);

        const events = list.unfollow(editorialCommunity1Id);

        expect(events).toHaveLength(1);
        expect(events[0].editorialCommunityId).toBe(editorialCommunity1Id);
      });
    });

    describe('when the community to be unfollowed is not already followed', () => {
      it('does nothing', async () => {
        const list = new FollowList(userId1);

        const events = list.unfollow(editorialCommunity1Id);

        expect(events).toHaveLength(0);
      });
    });

    describe('when the community to be unfollowed has already been unfollowed', () => {
      it('does nothing', async () => {
        const list = new FollowList(userId1);
        list.follow(editorialCommunity1Id);
        list.unfollow(editorialCommunity1Id);

        const events = list.unfollow(editorialCommunity1Id);

        expect(events).toHaveLength(0);
      });
    });
  });
});
