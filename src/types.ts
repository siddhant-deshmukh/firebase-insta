export interface UserStored {
    name : string,
    avatar : string,
    about : string,
    username : string,
    authComplete : boolean,
}
export interface User extends UserStored{
    email : string,
    emailVerified : boolean,
    uid : string,
    no_followers? : number,
    no_following? : number,
}
export interface PostContent{
    type: 'Image' | 'Video' | 'Gif',
    refrance : '',
}
export interface PostStored{
    authorId : string,
    desc? : string,
    createdAt : Date,
    content : [PostContent],
}
export interface Post extends PostStored{
    author : User,
    no_likes : number,
    no_comments : number,
}
export interface CommentStored{
    authorId : string,
    postId : string,
    parentId : string | null,    
}