import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

// SYNTAX MEANS USER1 FOLLOWING USER2 
export interface FollowingDoc extends BaseDoc {
    user1: ObjectId;
    user2: ObjectId;
}

export default class FollowingConcept {
    public readonly following = new DocCollection<FollowingDoc>("Following");

    async getFollowing(_id: ObjectId) {
        const following = await this.following.readMany({ user1: _id });
        if (!following) throw new NotFoundError("No such user exists");
        return following;
    }
    async getFollowers(_id: ObjectId) {
        const followers = await this.following.readMany({ user2: _id });
        if (!followers) throw new NotFoundError("No such user exists");
        return followers;
    }
    async followUser(_id: ObjectId, user: ObjectId) {
        await this.isNotFollowing(_id, user);
        const filter = { user1: _id, user2: user };
        await this.following.createOne(filter);
        return { msg: "Following successful", object: await this.following.readOne(filter) };
    }
    async unfollowUser(_id: ObjectId, user: ObjectId) {
        await this.isFollowing(_id, user);
        await this.following.deleteOne({ user1: _id, user2: user });
        return { msg: "Unfollow successful" }
    }
    async deleteUser(user: ObjectId) {
        await this.following.deleteMany({ user1: user });
        await this.following.deleteMany({ user2: user });
        return { msg: "User has unfollowed everyone, and removed every follower" };
    }
    private async isFollowing(_id: ObjectId, user: ObjectId) {
        const following = await this.following.readOne({ user1: _id, user2: user });
        if (!following) throw new BadValuesError("Cannot unfollow if not already following");
    }
    private async isNotFollowing(_id: ObjectId, user: ObjectId) {
        const following = await this.following.readOne({ user1: _id, user2: user });
        if (following) throw new BadValuesError("already following");
    }
}