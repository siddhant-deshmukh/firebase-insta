export interface IUserSnippet {
    name : string,
    avatar : string,
    about : string,
    username :string,
}
export interface IUserStored  extends IUserSnippet{
    numPosts : number,
    numStories : number,
    authComplete : boolean,
}
export interface IUser extends IUserStored{
    email : string,
    emailVerified : boolean,
    uid : string,
    no_followers? : number,
    no_following? : number,
}
export interface IPostContent{
    type: 'Image' | 'Video' | 'Gif',
    refrance : '',
}
export interface IPostStored{
    authorId : string,
    desc? : string,
    createdAt : Date,
    numMedia : number,
    numLikes? : number,
    numComments?:number,
}
export interface IPost extends IPostStored{
    author : IUserSnippet,
    imgUrls : string[],
    postId : string,
}
export interface CommentStored{
    authorId : string,
    postId : string,
    parentId : string | null,    
}