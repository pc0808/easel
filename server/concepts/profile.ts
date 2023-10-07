import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
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
        throw new Error("Not yet implemented!");
    }
    async getProfileByUsername(username: string) {
        throw new Error("Not yet implemented!");
    }
    async delete(_id: ObjectId) {
        throw new Error("Not yet implemented!");
        //BETA: delete posts and boards as well 
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
        throw new Error("Not yet implemented!");
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