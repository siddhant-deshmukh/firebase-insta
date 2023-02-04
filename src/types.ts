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
    relationWithUser? : 'self'|'following'|''
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
    hasLiked? : boolean,
}
export interface IPostSnippet extends IPostStored{
    imgUrls : string[],
    postId : string,
}
export interface ICommentStored{
    authorId : string,
    postId : string,
    parentId : string | null, 
    level : number,
    numLikes : number,
    text: string,
    numReply: number,
    createdAt : any,  
}
export interface IComment extends ICommentStored{
    commentId : string,
    user: IUserSnippet,
}