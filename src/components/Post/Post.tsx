import { collection, deleteDoc, doc, getDoc, query, setDoc, Timestamp } from 'firebase/firestore';
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import { db } from '../../firebase';
import { IPost } from '../../types'

export const Post = ({ post } : {post: IPost}) => {
  const [currentIndex,setCurrentIndex] = useState<number>(0);
  const [isLiked,setIsLiked] = useState<boolean>(false);
  const [comments,setComments] = useState([]);
  let [searchParams, setSearchParams] = useSearchParams();
  const { authState } = useContext(AppContext)
  
  const updateLikedState = useCallback(async ()=>{
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
  },[setIsLiked])
  useEffect(()=>{
    const docRef = doc(collection(db,`posts/${post.postId}/likedby`),authState.user?.uid);
    getDoc(docRef).then((docSnap)=>{
        if(docSnap.exists()){
            setIsLiked(true)
        }else{
            setIsLiked(false)
        }
    }).catch(()=>{
        console.log("Some error occured while fetching like state")
    })
  },[setIsLiked])

  return (
    <div className="bg-gray-100 p-4">
        <div className="bg-white border rounded-sm max-w-md">
            <div className="flex items-center px-4 py-3">
                <div className='group w-fit flex items-center'>
                    <img className="h-8 w-8 rounded-full"
                        src={(!post.author.avatar || post.author.avatar==="")?"/abstract-user.svg":post.author.avatar}
                        />
                    <div className="ml-3 ">
                        <span className="text-sm font-semibold group-hover:underline antialiased block leading-tight">{post.author.name}</span>
                        <span className="text-gray-600 text-xs block">{post.author.username}</span>
                    </div>
                </div>
            </div>

            <div className='relative w-full h-fit '>
                <img  src={post.imgUrls[currentIndex]}/>
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
                    disabled={(currentIndex>post.imgUrls.length-2)?true:false}
                    >  
                    {'>'}
                </button>
            </div>

            <div className="flex items-center justify-between mx-4 mt-3 mb-2">
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
            <button
                 className="font-semibold text-sm mx-4 mt-2 mb-4"
                 onClick={(event)=>{event.preventDefault(); setSearchParams({likedByModal:'Yes',postId:post.postId})}}>
                {(post.numLikes)?post.numLikes:"0"} likes
            </button>
        </div>
    </div>
  )
}
