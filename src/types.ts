export interface IUserStored {
    name : string,
    about : string,
    username :string,
    numPosts? : number,
    numFollowers? : number,
    numFollowing? : number,
    authComplete : boolean,
    avatar: string | number,
    relationWithUser? : 'self'|'following'|''
}
export interface IUserSnippet extends IUserStored{
    avatarUrl? : string ,
    uid : string,
}

export interface IUser extends IUserSnippet{
    
}
export interface IUserOwn extends IUserSnippet{
    email : string,
    emailVerified : boolean,
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
    user?: IUserSnippet,
}