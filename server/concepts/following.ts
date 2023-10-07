import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

// SYNTAX MEANS USER1 FOLLOWING USER2 
export interface FollowingDoc extends BaseDoc {
    user1: ObjectId;
    user2: ObjectId;
}

export default class FollowingConcept {
    public readonly following = new DocCollection<FollowingDoc>("Following");

    async getFollowing(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async getFollowers(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async followUser(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async unfollowUser(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async delete(filter: Partial<FollowingDoc>) {
        throw new Error("Not yet implemented!");
    }
    private async isFollowing(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    private async isNotFollowing(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
}