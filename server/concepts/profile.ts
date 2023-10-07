import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";
import { UserDoc } from "./user";

export interface ProfileDoc extends BaseDoc {
    username: string;
    avatar: string;
    biography: string;
    // following: ObjectId[];
    // followedBy: ObjectId[];
}

export default class ProfileConcept {
    public readonly profiles = new DocCollection<ProfileDoc>("Profiles");

    async create(username: string) {
        const _id = await this.profiles.createOne({ username: username, avatar: "", biography: "" });
        return { msg: "Content successfully created!", profile: await this.profiles.readOne({ _id }) };
    }
    async getProfile(_id: ObjectId) {
        const prof = await this.profiles.readOne({ _id });
        if (prof === null) {
            throw new NotFoundError(`User not found!`);
        }
        return prof;
    }
    async getProfileByUsername(username: string) {
        const prof = await this.profiles.readOne({ username });
        if (prof === null) {
            throw new NotFoundError(`Profile not found!`);
        }
        return prof;
    }
    async getProfiles(username?: string) {
        // If username is undefined, return all users by applying empty filter
        const filter = username ? { username } : {};
        return await this.profiles.readMany(filter);
    }
    async delete(_id: ObjectId) {
        await this.profiles.deleteOne({ _id });
    }
    async changeUsername(newName: string) {
        throw new Error("Not yet implemented!");
        //BETA: UPDATE DATA IN BOARDS/POSTS AS WELL 
    }
    //AVATAR WILL MOST LIKELY BE OPTIONAL OR HAVE DEFAULT VALUE 
    async changeAvatar(newFile: string) {
        throw new Error("Not yet implemented!");
    }
    async changeBiography(newBio: string) {
        throw new Error("Not yet implemented!");
    }
    async getPosts(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async getBoards(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    //for updating boards, posts, following AND followed:
    async update(_id: ObjectId, update: Partial<UserDoc>) {
        await this.profiles.updateOne({ _id }, update);
        return { msg: "Successfully done!", profile: await this.profiles.readOne(_id) };
    }
    async getFollowing(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async getFollowed(_id: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async followUser(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
    async unfollowUser(_id: ObjectId, user: ObjectId) {
        throw new Error("Not yet implemented!");
    }
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