import { collection, getDoc, getDocs, limit, orderBy, query, doc, deleteDoc, setDoc, Timestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { InfiniteData, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import { auth, db, storage } from '../../firebase';
import { IComment, ICommentStored, IPost, IPostStored, IUser, IUserSnippet, IUserStored } from '../../types';
import UserSnippetCard from '../UserSnippetCard';
import { CommentCard } from './CommentCard';
import CommentsList from './CommentsList';

export const PostDisplay = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [ownComments,setOwnComments] = useState<IComment[]>([]);
  const [currentIndex,setCurrentIndex] = useState<number>(0);
  const [post,setPost] = useState<IPost | null>(null)
  const [userData,setUserData] = useState<IUserStored | null>(null)
  const [isLiked,setIsLiked] = useState<boolean>(false);
  const { authState } = useContext(AppContext)
  const newCommentRef = useRef<HTMLInputElement | null>(null)
  const postId = searchParams.get('postId')
  
  const queryClient = useQueryClient()
  
  const closeModal = useCallback(()=>{
    setSearchParams((prev)=>{
        // let temp_ = prev;
        prev.delete('showPostModal')
        return prev
    })
  },[setSearchParams])

  const addComment = useCallback(async ()=>{
    if(!newCommentRef.current || !newCommentRef.current?.innerText || !post ) return
    let text = newCommentRef.current.innerText.trim()
    if(text.length < 1 && text.length>500) return
    const comment : ICommentStored = { 
      postId : post?.postId as string, 
      authorId : authState.user?.uid as string,
      text : newCommentRef.current.innerText.trim(),
      numLikes : 0,
      numReply : 0,
      level : 0,
      parentId : null,
      createdAt : Timestamp.fromDate(new Date())
    } 
    console.log("New :",comment)
    setDoc(doc(collection(db,`posts/${post.postId}/comments`)),{
        ...comment,
    }).then((onFulfield)=>{
        setOwnComments((prev)=>{
          const comment_ : IComment = {...comment,user : authState.user as IUserSnippet,commentId:prev.length.toString()}
          return [comment_,...prev]
        })
        console.log("New comment !!!",onFulfield)
    }).catch((err)=>{
        console.log("Something goes wrong to change liked state",err)
    })
    

    if(newCommentRef.current) newCommentRef.current.innerText = "";
  },[setOwnComments,post,newCommentRef,authState])
  
  const updateLikedState = useCallback(async ()=>{
    if(!post) return
    const docRef = doc(collection(db,`posts/${post.postId}/likedby`),authState.user?.uid);
    const docSnap = await getDoc(docRef)
    console.log(`posts/${post.postId}/likedby`,authState.user?.uid,Date())
    if(docSnap.exists()){
        deleteDoc(doc(collection(db,`posts/${post.postId}/likedby`),authState.user?.uid))
            .then(()=>{
                setIsLiked(false)
            }).catch((err)=>{
                console.log("Some error occured",err)
            })
    }else{
        setDoc(doc(collection(db,`posts/${post.postId}/likedby`),authState.user?.uid),{
            createdAt : Timestamp.fromDate(new Date())
        }).then((onFulfield)=>{
            setIsLiked(true)
        }).catch((err)=>{
            console.log("Something goes wrong to change liked state",err)
        })
    }
  },[setIsLiked,post])

  const getUserData = async ()=>{
      const userCache : IUserStored | undefined = queryClient.getQueryData(['user','snippets',post?.authorId])
      let relationWithUser : IUserStored['relationWithUser'] ;
      if(authState.user?.uid === post?.authorId){ 
        relationWithUser = 'self'
      }else{
        const doc_ = await getDoc(doc(db,`users/${authState.user?.uid}/following/${post?.authorId}`))
        if(doc_.exists()) relationWithUser = 'following'
        else relationWithUser = ''
      }

      if(userCache){
        userCache.relationWithUser = relationWithUser
        return userCache
      }

      if(!post?.authorId) return null
      const user : IUserStored | undefined = (await getDoc(doc(db,`users/${post?.authorId}`))).data() as IUserStored;
      user.relationWithUser = relationWithUser

      console.log("User of this page",user)
      return user
  }
  const getOwnComments = async ()=>{
      // console.warn("Here to get own comments")
      const q = query(collection(db,`posts/${postId}/comments`),
          where('authorId','==',authState.user?.uid),
          where('level','==',0),
          where('parentId','==',null),
          // orderBy('authorId','asc'),
          orderBy('createdAt','desc'),
          orderBy('numLikes','desc'),
          limit(10));
      const docsSnapShot = await getDocs(q);
      console.log("user own comments", docsSnapShot.docs)

      let user = authState.user as IUserSnippet;  

      const comments = docsSnapShot.docs.map((commentDoc)=>{
          return {commentId : commentDoc.id , ...commentDoc.data(),user} as IComment
      })
      console.log("comments", comments  )
      return comments
  }
  const getPost = async ()=>{
      //to get cache data
      const oldPost  : IPost | undefined = queryClient.getQueryData(['post',postId])
      console.log("Check Post data", oldPost)
      if(oldPost) return oldPost

      // how to retrive data from server
      /**
      const postDocRef = doc(db,'posts',postId as string)
      const postDocSnap = await getDoc(postDocRef)
      if(postDocSnap.exists()){
        const postDoc = postDocSnap.data() as IPostStored;
        const author = (await getDoc(doc(db,`users/${postDoc.authorId}`))).data() as IUserSnippet; 

        let urls : Promise<string>[] = []
        for(let i=0;i<postDoc.numMedia;i++){
          urls[i]= getDownloadURL(ref(storage,`posts/${postDoc.authorId}/${postId}/${i}`))
        }
        const imgUrls= await Promise.all(urls)
        return {...postDoc,author,postId:postDocSnap.id,imgUrls} as IPost
      }else{
        return null
      }
       */
  }

  useEffect(()=>{  
    getPost().then((value)=>{
      if(value){
        setPost(value)
      }
    })
    getOwnComments().then((comments)=>{
      if(comments){
        setOwnComments(comments)
      }
    })
  },[setPost,setOwnComments])
  useEffect(()=>{
    if(!post) return
    getUserData().then((user)=>{
      if(user){
        setUserData(user)
      }
    })
  },[post,setUserData])

  return (
    <div>
      <div className={`modal ${(searchParams.get('showPostModal')==='Yes' && searchParams.get('postId'))?"":"hidden"} 
        overflow-x-hidden h-screen fade fixed  flex items-center top-0 left-0  w-full outline-none bg-black bg-opacity-40  overflow-y-auto`}
      id="exampleModalScrollable" tabIndex={-1} py-20 aria-labelledby="exampleModalScrollableLabel" aria-hidden="true">
      <button type="button"
        className="absolute right-4 top-4 btn-close box-content w-fit h-fit p-2 items-center text-black border-none rounded-full opacity-50 bg-white focus:shadow-none focus:outline-none focus:opacity-100 hover:bg-slate-100 hover:opacity-75 hover:no-underline"
        data-bs-dismiss="modal" aria-label="Close"
        onClick={(event)=>{event.preventDefault(); closeModal() }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
      </button>
      <div className="modal-dialog  modal-dialog-scrollable flex  max-h-screen w-11/12 h-11/12 relative mx-auto     pointer-events-none">
        <div
          className="modal-content mx-auto border-none rounded-xl max-w-full w-fit  max-h-full  p-0.5 shadow-lg  relative  flex  pointer-events-auto bg-white bg-clip-padding  outline-none text-current"
          >
          {
            post &&
            <div className='relative flex items-center w-fit h-full '
              style={{minWidth:'400px',minHeight:'500px'}}>
              <img  src={post?.imgUrls[currentIndex]} className="mx-auto "/>
              <button 
                className='absolute inset-y-1/2 h-fit left-0  px-2 w-fit rounded-full text-white bg-black opacity-40'
                onClick={(event)=>{event.preventDefault(); setCurrentIndex((prev)=>prev-1)}}
                disabled={(currentIndex<1)?true:false}
                >  
                {'<'}
              </button>
              <button 
                className='absolute inset-y-1/2 h-fit right-0 px-2 w-fit rounded-full text-white bg-black opacity-40'
                onClick={(event)=>{event.preventDefault(); setCurrentIndex((prev)=>prev+1)}}
                disabled={(currentIndex>post?.imgUrls?.length-2)?true:false}
                >  
                {'>'}
              </button>
            </div>
          }
          {
            post && 
            <div className='flex flex-col bg-white w-fit '
              style={{minWidth:'400px',minHeight:'500px'}}>
              <UserSnippetCard author={userData} uid={post.authorId}/>

              {/* list of comments */}
              <div className='h-full w-full overflow-y-auto'>
                <div>
                  {
                    ownComments && 
                    ownComments.map((comment)=>{
                      return (<div key={"ownComment_"+comment.commentId}>
                        <CommentCard comment={comment}/>
                      </div>)
                    })
                  }
                </div>
                <CommentsList postId={post.postId} endUserId={authState.user?.uid as string}/>
              </div>

              {/* Button list to perform operations such as likes, share, save */}
              <div className="flex items-center w-auto  h-fit justify-between mx-4 mt-3 mb-2">
                <div className="flex gap-4 items-center">
                  <button
                      className='w-fit h-fit'
                      onClick={(event)=>{event.preventDefault(); updateLikedState()}}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" fill={(isLiked)?"red":"none"} viewBox="0 0 24 24" strokeWidth={(isLiked)?0.5:1.5} stroke="currentColor" className="w-7 hover:fill-red-400 border-red-500 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>

                  </button>
                  <button
                      className='w-fit h-fit'
                      onClick={(event)=>{event.preventDefault(); setSearchParams((prev)=>{return {...prev,postId:post.postId,showPostModal:'Yes'}})}}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                  </button>
                  <svg fill="#262626" height="24" viewBox="0 0 48 48" width="24"><path d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"></path></svg>
                </div>
                <div className="flex">
                    <svg fill="#262626" height="24" viewBox="0 0 48 48" width="24"><path d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z"></path></svg>
                </div>
              </div>
              
              {/* To show no. of like  */}
              <div className='w-auto h-fit'>
                <button
                      className="font-semibold w-fit h-fit px-2 hover:underline text-left text-sm mx-4"
                      onClick={(event)=>{event.preventDefault(); setSearchParams({ ...searchParams ,likedByModal:'Yes',postId:post.postId})}}>
                    {(post?.numLikes)?post?.numLikes:"0"} likes
                </button>
              </div>

              {/* To make new comment */}
              <div className='flex relative w-auto pl-3 items-center'>
                <div ref={newCommentRef}  contentEditable={true}
                  className='w-full pl-10 p-1 h-fit max-h-20 overflow-y-auto focus:outline-1 outline-gray-300'  
                  placeholder='write a comment'
                >
                </div>
                <div className='absolute left-4 bottom-1'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <button 
                  className='w-fit text-blue-500 hover:underline px-3 py-1 font-semibold'
                  onClick={(event)=>{event.preventDefault(); addComment()}}
                  >
                  Post
                </button>
              </div>
            </div>
          }
        </div>
      </div>
      </div>
    </div>
  )
}


export default PostDisplay;
