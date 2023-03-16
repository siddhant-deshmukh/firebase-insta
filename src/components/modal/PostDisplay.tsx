import { collection, getDoc, getDocs, limit, orderBy, query, doc, deleteDoc, setDoc, Timestamp, where } from 'firebase/firestore';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { InfiniteData, QueryClient, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import AppContext, { getUserData } from '../../context/AppContext';
import { auth, db, storage } from '../../firebase';
import { IComment, ICommentStored, IPost, IPostStored, IUser, IUserSnippet, IUserStored } from '../../types';
import { updateLikedState } from '../Post/Post';
import UserSnippetCard from '../UserSnippetCard';
import { CommentCard } from './CommentCard';
import CommentsList from './CommentsList';



export const PostDisplay = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [ownComments, setOwnComments] = useState<IComment[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [post, setPost] = useState<IPost | null>(null)
  const [author, setAuthor] = useState<IUserSnippet | null>(null)

  const { authState } = useContext(AppContext)
  const newCommentRef = useRef<HTMLInputElement | null>(null)
  const postId = searchParams.get('postId')

  const queryClient = useQueryClient()

  const closeModal = useCallback(() => {
    setSearchParams((prev) => {
      // let temp_ = prev;
      prev.delete('showPostModal')
      return prev
    })
  }, [setSearchParams])

  const addComment = useCallback(async () => {
    if (!newCommentRef.current || !newCommentRef.current?.innerText || !post) return
    let text = newCommentRef.current.innerText.trim()
    if (text.length < 1 && text.length > 500) return
    const comment: ICommentStored = {
      postId: post?.postId as string,
      authorId: authState.user?.uid as string,
      text: newCommentRef.current.innerText.trim(),
      numLikes: 0,
      numReply: 0,
      level: 0,
      parentId: null,
      createdAt: Timestamp.fromDate(new Date())
    }
    console.log("New :", comment)
    setDoc(doc(collection(db, `posts/${post.postId}/comments`)), {
      ...comment,
    }).then((onFulfield) => {
      setOwnComments((prev) => {
        const comment_: IComment = { ...comment, user: authState.user as IUserSnippet, commentId: prev.length.toString() }
        return [comment_, ...prev]
      })
      console.log("New comment !!!", onFulfield)
    }).catch((err) => {
      console.log("Something goes wrong to change liked state", err)
    })


    if (newCommentRef.current) newCommentRef.current.innerText = "";
  }, [setOwnComments, post, newCommentRef, authState])



  const getOwnComments = async () => {
    // console.warn("Here to get own comments")
    const q = query(collection(db, `posts/${postId}/comments`),
      where('authorId', '==', authState.user?.uid),
      where('level', '==', 0),
      where('parentId', '==', null),
      // orderBy('authorId','asc'),
      orderBy('createdAt', 'desc'),
      orderBy('numLikes', 'desc'),
      limit(10));
    const docsSnapShot = await getDocs(q);
    console.log("user own comments", docsSnapShot.docs)

    let user = authState.user as IUserSnippet;

    const comments = docsSnapShot.docs.map((commentDoc) => {
      return { commentId: commentDoc.id, ...commentDoc.data(), user } as IComment
    })
    console.log("comments", comments)
    return comments
  }
  const getPost = async () => {
    //to get cache data
    const oldPost: IPost | undefined = queryClient.getQueryData(['post', postId])
    console.log("Check Post data", oldPost)
    if (oldPost) return oldPost

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

  useEffect(() => {
    getPost().then((value) => {
      if (value) {
        setPost(value)
      }
    })
    getOwnComments().then((comments) => {
      if (comments) {
        setOwnComments(comments)
      }
    })
  }, [setPost, setOwnComments])
  useEffect(() => {
    if (!post) return
    getUserData((post.authorId)?post.authorId:'default', queryClient, authState.user?.uid).then((user) => {
      if (user) {
        setAuthor(user)
      }
    })
  }, [post, setAuthor])

  return (
    <div>
      {
        post && author && ownComments &&
        <div className={`modal ${(searchParams.get('showPostModal') === 'Yes' && searchParams.get('postId')) ? "" : "hidden"} 
        overflow-x-hidden h-screen fade fixed  flex items-center top-0 left-0  w-full outline-none bg-black bg-opacity-40  overflow-y-auto`}
          id="exampleModalScrollable" tabIndex={-1} py-20 aria-labelledby="exampleModalScrollableLabel" aria-hidden="true">

          {/* Close Button */}
          <button type="button"
            className="absolute right-4 top-16 z-50 sm:top-4 btn-close box-content w-fit h-fit p-2 items-center text-black border-none rounded-full opacity-50 bg-white focus:shadow-none focus:outline-none focus:opacity-100 hover:bg-slate-100 hover:opacity-75 hover:no-underline"
            data-bs-dismiss="modal" aria-label="Close"
            onClick={(event) => { event.preventDefault(); closeModal() }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Modal with w-full*/}
          <div className="flex h-4/6 sm:h-5/6   w-full  relative mx-auto pointer-events-none" style={{ minHeight: '384px' }}>
            {/* Main Modal with w-fit*/}
            <div
              className="mx-auto h-auto border-none rounded-xl max-w-full w-fit  max-h-full  p-0.5 shadow-lg  relative  flex  pointer-events-auto bg-clip-padding  outline-none text-current"
            >
              {
                post &&
                <div className='relative flex items-center w-auto  bg-black h-full max-w-fit'>
                  <img src={post?.imgUrls[currentIndex]} className="w-full max-h-full overflow-y-hidden max-w-xl" />
                  <button
                    className='absolute inset-y-1/2 h-fit left-0.5  px-2 w-fit rounded-full text-white bg-black opacity-40'
                    onClick={(event) => { event.preventDefault(); setCurrentIndex((prev) => prev - 1) }}
                    hidden={(currentIndex < 1) ? true : false}
                  >
                    {'<'}
                  </button>
                  <button
                    className='absolute inset-y-1/2 h-fit right-0.5 px-2 w-fit rounded-full text-white bg-black opacity-40'
                    onClick={(event) => { event.preventDefault(); setCurrentIndex((prev) => prev + 1) }}
                    hidden={(currentIndex > post.imgUrls.length - 2) ? true : false}
                  >
                    {'>'}
                  </button>
                </div>
              }
              {
                post &&
                <div className='hidden sm:flex flex-col bg-white w-80 min-w-fit h-full' >
                  <UserSnippetCard author={author} />

                  {/* list of comments */}
                  <div className='h-full w-full overflow-y-auto'>
                    <div>
                      {
                        ownComments &&
                        ownComments.map((comment) => {
                          return (<div key={"ownComment_" + comment.commentId}>
                            <CommentCard comment={comment} />
                          </div>)
                        })
                      }
                    </div>
                    <CommentsList postId={post.postId} endUserId={authState.user?.uid as string} />
                  </div>

                  {/* Button list to perform operations such as likes, share, save */}
                  <div
                    className="flex items-center  hit justify-between mx-1 mt-2 "
                  >
                    <div className="flex gap-4 items-center ">
                      <button
                        className='w-fit h-fit'
                        // @ts-ignore
                        onClick={(event) => { event.preventDefault(); updateLikedState(post, setPost, queryClient, authState.user?.uid) }}
                      >
                        {/* ${(post.hasLiked) ? 'text-white' : 'text-black'} */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill={(post.hasLiked) ? "red" : "none"} viewBox="0 0 24 24" strokeWidth={(post.hasLiked) ? 1.5 : 1.5} stroke="currentColor" className={`w-7  hover:fill-red-400 border-red-500 h-7`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                      <button
                        className='w-fit h-fit '
                        onClick={(event) => { event.preventDefault(); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 pb-0.5 hover:text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                        </svg>
                      </button>
                      <button
                        className='w-7 h-7 pb-1.5 overflow-hidden'
                        onClick={(event) => { event.preventDefault(); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7  hover:text-gray-500 pb-1" style={{ transform: 'rotate(325deg)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </button>
                    </div>
                    <button
                      className='w-fit h-fit '
                      onClick={(event) => { event.preventDefault(); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7  hover:text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* To show no. of like  */}
                  <div className='w-auto h-fit'>
                    <button
                      className="font-semibold w-fit h-fit   hover:underline text-left text-sm mx-2 "
                      onClick={(event) => { event.preventDefault(); setSearchParams({ ...searchParams, likedByModal: 'Yes', postId: post.postId }) }}>
                      {(post?.numLikes) ? post?.numLikes : "0"} likes
                    </button>
                  </div>

                  {/* To make new comment */}
                  <div className='flex relative py-2 pl-3 w-96 items-center'>
                    <div ref={newCommentRef} contentEditable={true}
                      className='w-full pl-8 p-1 h-fit max-h-20 overflow-y-auto text-sm focus:border border-gray-400 outline-none'
                      placeholder='write a comment'
                    >
                    </div>
                    <div className='absolute left-4 bottom-3'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                      </svg>
                    </div>
                    <button
                      className='w-fit text-blue-500 hover:underline px-3 py-1 font-semibold'
                      onClick={(event) => { event.preventDefault(); addComment() }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  )
}


export default PostDisplay;
