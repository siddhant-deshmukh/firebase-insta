import { collection, deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import React, {  useContext, useEffect, useState } from 'react'
import {  QueryClient, useQueryClient } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import AppContext, { getUserData } from '../../context/AppContext';
import { db } from '../../firebase';

import { IPost, IUserSnippet } from '../../types'
import { getPost } from '../../utils/post_related_functions';
import UserSnippetCard from '../UserSnippetCard';




export const Post = ({ postId }: { postId: string }) => {

  const [currentIndex, setCurrentIndex] = useState<number>(0); //in case of multiple images in post
  let [searchParams, setSearchParams] = useSearchParams();
  const { authState } = useContext(AppContext)
  const queryClient = useQueryClient()
  const [author, setAuthor] = useState<IUserSnippet | null>(null)
  const [imgLoaded, setImgLoaded] = useState<boolean>(false)
  const [postState, setPostState] = useState<IPost | null | undefined>(null)
  const [error, setError] = useState<string>('')

  const [fullDesc, setFullDesc] = useState<boolean>(false)
  //   useEffect(()=>{
  //     const oldPagesArray = queryClient.getQueryData('postFeed')
  //     console.log("newPagesArray",newPagesArray)
  //     console.log("Data",pageNum,index,oldPagesArray?.pages[pageNum]?.data[index])
  //   },[])
  const getPostFromCache = async (postId: string) => {
    const post: IPost | undefined = queryClient.getQueryData(['post', postId])
    if (post) {
      return post
    } else {
      return await getPost(postId, queryClient, authState.user?.uid)
    }
  }

  useEffect(() => {
    getPostFromCache(postId).then(data => {
      if (!data) {
        setPostState(undefined)
        return;
      }
      setPostState(data)
      getUserData((data.authorId) ? data.authorId : '', queryClient, authState.user?.uid).then((user) => {
        if (user) {
          setAuthor(user)
        }
      })
    })

  }, [setAuthor])
  return (
    <div className="w-auto shadow-md rounded-lg overflow-hidden border-gray-200" >
      <div className="bg-white max-h-full border rounded-sm">
        <UserSnippetCard author={author} />

        {
          postState && 
          <>
            {/* Post Content */}
            <div className='relative w-full overflow-y-hidden h-full flex items-center' style={{ minHeight: '300px', minWidth: '300px', maxHeight: '600px' }}>
              {
                !imgLoaded &&
                <div role="status" className="flex mx-auto w-96 items-center justify-center h-96  max-w-sm bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700">
                  <svg className="w-full h-full mx-auto text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 384 512"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path></svg>
                </div>
              }
              <img className='max-h-full max-w-full  mx-auto' onLoad={() => { setImgLoaded(true) }} onLoadStart={() => { setImgLoaded(false) }} src={postState.imgUrls[currentIndex]} />
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
                hidden={(currentIndex > postState.imgUrls.length - 2) ? true : false}
              >
                {'>'}
              </button>
            </div>

            {/* Bottom Part */}
            <div className='hit text-sm text-left text-gray-700  mx-1 mt-1'>
              <span><Link to={`/u/${author?.uid}`} className='text-black font-medium mr-2'>@{author?.username}</Link></span>
              {(fullDesc) ? postState.desc : postState.desc?.slice(0, 100)}
              {
                postState.desc && postState.desc.length > 100 && <span>
                  <button
                    className='font-semibold px-1 underline text-blue-600 text-sm'
                    onClick={(event) => { event.preventDefault(); setFullDesc((prev => !prev)) }}>
                    {(fullDesc) ? 'show less' : 'show more'}
                  </button>
                </span>
              }

            </div>
            <div
              className="flex items-center hit justify-between mx-1 mt-2 "
            >
              <div className="flex gap-4 items-center ">
                <button
                  className='w-fit h-fit'
                  // @ts-ignore
                  onClick={(event) => { event.preventDefault(); updateLikedState(postState, setPostState, queryClient, authState.user?.uid) }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={(postState.hasLiked) ? "red" : "none"} viewBox="0 0 24 24" strokeWidth={(postState.hasLiked) ? 0.5 : 1.5} stroke="currentColor" className="w-7 hover:fill-red-400 border-red-500 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                <button
                  className='w-fit h-fit'
                  onClick={(event) => { event.preventDefault(); setSearchParams((prev) => { return { ...prev, postId: postState.postId, showPostModal: 'Yes' } }) }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 hover:text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                </button>
                <button
                  className='w-7 h-7 pb-1.5 overflow-hidden'
                  onClick={(event) => { event.preventDefault(); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7  hover:text-gray-500" style={{ transform: 'rotate(325deg)' }}>
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

            <button
              className="font-semibold text-sm mx-2 mb-5"
              onClick={(event) => { event.preventDefault(); setSearchParams({ likedByModal: 'Yes', postId: postState.postId }) }}>
              {(postState.numLikes) ? postState.numLikes : "0"} likes
            </button>
          </>
        }
        {
          !postState &&
          <div className='animate-pulse  w-full overflow-y-hidden h-full flex items-center' style={{ minHeight: '300px',    minWidth: '300px', maxHeight: '600px' }}>
          </div>
        }
      </div>
    </div>
  )
}
