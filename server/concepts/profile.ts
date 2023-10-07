import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";
import { UserDoc } from "./user";

export interface ProfileDoc extends BaseDoc {
    user: ObjectId;
    avatar: string;
    biography: string;
}

export default class ProfileConcept {
    public readonly profiles = new DocCollection<ProfileDoc>("Profiles");

    async create(user: ObjectId) {
        const _id = await this.profiles.createOne({ user: user, avatar: "", biography: "" });
        return { msg: "Content successfully created!", profile: await this.profiles.readOne({ user }) };
    }
    // will filter either by *profile* objectID 
    async getProfile(_id: ObjectId) {
        const profile = await this.profiles.readOne({ _id: _id });
        if (!profile) {
            throw new NotFoundError(`Profile not found!`);
        }
        return profile;
    }
    async getProfileByUser(user: ObjectId) {
        const profile = await this.profiles.readOne({ user: user });
        if (!profile) {
            throw new NotFoundError(`Sorry, could not find profile!`);
        }
        return profile;
    }
    async getAllProfiles() {
        return await this.profiles.readMany({});
    }
    async delete(_id: ObjectId) {
        await this.profiles.deleteOne({ _id: _id });
    }

    //for updating boards, posts, following AND followed:
    async update(_id: ObjectId, update: Partial<UserDoc>) {
        await this.profiles.updateOne({ _id }, update);
        return { msg: "Successfully done!", profile: await this.profiles.readOne(_id) };
    }

    // TO DO ON FOLLOWING DOCS 
    async getFollowingPosts(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async getFollowingBoards(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    private async isFollowing(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    private async isNotFollowing(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    private async userNotSelf(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    private async userExist(user: ObjectId) {

    }
}