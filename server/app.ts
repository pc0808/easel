import { ObjectId } from "mongodb";
import BoardConcept from "./concepts/board";
import ContentConcept from "./concepts/content";
import FollowingConcept from "./concepts/following";
import FriendConcept from "./concepts/friend";
import ProfileConcept from "./concepts/profile";
import TagsConcept from "./concepts/tags";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Profile = new ProfileConcept();
export const Post = new ContentConcept<string>("Posts");
export const Board = new BoardConcept("Boards");
export const Friend = new FriendConcept();
export const PostTags = new TagsConcept<string>("Tag Posts");
export const BoardTags = new TagsConcept<ObjectId[]>("Tag Boards");
export const Following = new FollowingConcept(); 