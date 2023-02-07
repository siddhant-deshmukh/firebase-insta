import { QueryClient, useQueryClient } from 'react-query'
import { collection, doc, DocumentData, endAt, getDoc, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { useInfiniteQuery } from 'react-query'
import { Post } from '../components/Post/Post'
import AppContext, { getAvatarUrl, getUserData } from '../context/AppContext'
import { db, storage } from '../firebase'
import { IPost, IPostStored, IUser, IUserSnippet, IUserStored } from '../types'

export async function getPostsIdAndCacheDetails(postData : IPostStored,postId:string,queryClient : QueryClient,ownUid:string | undefined) {

  const checkPost = queryClient.getQueryData(['post',postId]) as IPost | undefined
  if(checkPost) return postId
  
  let urls : Promise<string>[] = []
  for(let i=0;i<postData.numMedia;i++){
    urls[i]= getDownloadURL(ref(storage,`posts/${postData.authorId}/${postId}/${i}`))
  }
  let imgUrlsPromise =  Promise.all(urls)
  let authorPromise  =  getUserData(postData.authorId,queryClient,ownUid)
  let checkLikedPromise =  getDoc(doc(collection(db,`posts/${postId}/likedby`),ownUid))

  const [imgUrls,author,checkLiked] = await Promise.all([imgUrlsPromise,authorPromise,checkLikedPromise])
  const finalDoc : IPost = {
    ...postData,
    imgUrls,
    author,
    hasLiked: checkLiked.exists(),
    postId
  }
  console.log("Updated doc!",finalDoc)
  queryClient.setQueryData(['post',postId],finalDoc)
  return postId
}

const Home = () => {

  // const [postFeed,setPostFeed] = useState<IPost[]>([])
  const { authState } = useContext(AppContext)
  const postPerPage = 3
  const firstPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const lastPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const queryClient = useQueryClient()

  const getPostFromCache =  (postId:string) => {
    const post : IPost | undefined = queryClient.getQueryData(['post',postId])
    if(post){
      return post 
    }else{
      return 
    }
  }

  const fetchPosts = async ({pageParam = 1}) => {
    
    const q_ = (lastPostDoc.current)?(query(collection(db,'posts'),orderBy('createdAt','desc'),startAfter(lastPostDoc.current),limit(postPerPage))):(query(collection(db,'posts'),orderBy('createdAt','desc'),limit(postPerPage)))
    const postFeedSnapshots_ = await getDocs(q_)
    if(!firstPostDoc.current) firstPostDoc.current = postFeedSnapshots_.docs[0]
    lastPostDoc.current = postFeedSnapshots_.docs[postFeedSnapshots_.docs.length-1]
    const promises = postFeedSnapshots_.docs.map(async (doc)=>{
      
      const checkPostInCache = queryClient.getQueriesData(['post',doc.id])
      console.log(checkPostInCache,'post',doc.id)

      let docData = {...doc.data()} as IPostStored;
      //console.log(doc.id,doc.data())
      return getPostsIdAndCacheDetails(docData,doc.id,queryClient,authState.user?.uid)
    })
    const data = await Promise.all(promises)
    
    console.log("data for page",pageParam, ' :  ', data)
    
    return {data,nextPage:pageParam+1,isLast:(postFeedSnapshots_.size < postPerPage)}
  }
  const {
    isLoading,
    isError,
    error,
    data : postFeed,
    isFetching,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery('postFeed',fetchPosts,{
    getNextPageParam : (lastPage,pages)=>{
      if(lastPage.isLast) return undefined
      return lastPage.nextPage + 1
    },
    staleTime: Infinity,

  })

  // useEffect(()=>{
  //   //refreshPosts()
    
  // },[])
  const loader = useRef(null)
  const observerCallback = useCallback((entries : IntersectionObserverEntry[])=>{
    const target = entries[0]
    if(target.isIntersecting && !isFetching){
      console.log("Is intersection!" , isFetching,hasNextPage )
      fetchNextPage()
    }
  },[loader,isFetching,fetchNextPage,hasNextPage,isLoading])
  useEffect(()=>{
    const observer = new IntersectionObserver(observerCallback,{
      root:null,
      rootMargin:'0px',
      threshold: 0.25
    })
     //@ts-ignore
    if(loader && loader.current) observer.observe(loader.current);
    return ()=>{
      //@ts-ignore
      if(loader.current) observer.unobserve(loader.current);
    }
  },[loader,observerCallback])

  return (
    <div className='overflow-y-hidden mx-auto w-fit'>
      Home {import.meta.env.VITE_FRONT_END_URL}
      What is going on!
      {hasNextPage}
      
      {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p>There was an error</p>
        ) : (
          //@ts-ignore
          <div className='py-10' style={{maxWidth:'500px'}}>
            {
              postFeed && postFeed.pages.map((page,pageNum)=>{
                return page.data.map((postId,index)=>{
                  let post = getPostFromCache(postId)
                  if(post){
                    return <div key={postId}>
                    <Post post={post} />
                    </div>
                  }
                })
              })
            }
          </div>
        )}
      <div ref={loader}>This is the end</div>
    </div>
  )
}
/**
 
{
    "authorId": "2dPrqpCfgHXUHjOYgRR4tn4xOB23",
    "createdAt": {
        "seconds": 1675020755,
        "nanoseconds": 884000000
    },
    "numMedia": 2,
    "desc": "Meow",
    "imgUrl": [
        "https://firebasestorage.googleapis.com/v0/b/instagram-01-c1cb5.appspot.com/o/posts%2F2dPrqpCfgHXUHjOYgRR4tn4xOB23%2FTfhApRzpbFzSPKAEgYMg%2F0?alt=media&token=194d1610-09b0-4fa8-84df-f213c8e22528",
        "https://firebasestorage.googleapis.com/v0/b/instagram-01-c1cb5.appspot.com/o/posts%2F2dPrqpCfgHXUHjOYgRR4tn4xOB23%2FTfhApRzpbFzSPKAEgYMg%2F0?alt=media&token=194d1610-09b0-4fa8-84df-f213c8e22528"
    ],
    "user": {
        "authComplete": false,
        "name": "2019bec072",
        "numPosts": 5,
        "avatarUrl": "",
        "username": "2019b87345",
        "about": ""
    }
}
 */
export default Home