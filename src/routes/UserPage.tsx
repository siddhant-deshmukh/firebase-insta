import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, limit, orderBy, query, QueryDocumentSnapshot, setDoc, startAfter } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { Link, useParams } from 'react-router-dom'
import AppContext from '../context/AppContext';
import { db, storage } from '../firebase';
import { IPost, IPostSnippet, IPostStored, IUserSnippet, IUserStored } from '../types';

const UserPage = () => {
  
  const { userId } = useParams();
  const [userInfo,setUserInfo] = useState<IUserStored | null>(null);
  // const [relation,setRelation] = useState<'self' | 'follows' | 'desntFoloow' | null>(null)
  const queryClient = useQueryClient()
  const {authState} = useContext(AppContext)
  const postPerPage = 4 
  const firstPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const lastPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)

  const changeUserFollowState = useCallback( () =>{
      console.log("Here!!!!!!!!!!11",userInfo)
      if( !userInfo)return ;
      if(userInfo.relationWithUser === "self") return;

      const selfId = authState.user?.uid
      console.log("Meowwwwwwwwwwww  ")
      console.log(userInfo.relationWithUser)
      if(userInfo.relationWithUser === 'following'){
        console.log(`users/${selfId}/following/${userId}`)
        deleteDoc(doc(db,`users/${selfId}/following/${userId}`))
          .then((value)=>{
            console.log("Sucessfully updated state!",value)
            setUserInfo((prev)=>{
              if(prev)
              return {...prev,relationWithUser:''};
              else return  null
            })
          }).catch((err)=>{
            console.log("error in unfollowing!",err)
          })
      }else{
        setDoc(doc(db,`users/${selfId}/following/${userId}`),{
          exists : true
        }).then((value)=>{
            console.log("Sucessfully updated state!",value)
            setUserInfo((prev)=>{
              if(prev)
              return {...prev,relationWithUser:'following'};
              else return  null
            })
          })
      }
  },[userInfo,setUserInfo])

  const getUserData = async ()=>{
      const userCache : IUserStored | undefined = queryClient.getQueryData(['user','snippets',userId])
      let relationWithUser : IUserStored['relationWithUser'] ;
      if(authState.user?.uid === userId){ 
        relationWithUser = 'self'
      }else{
        const doc_ = await getDoc(doc(db,`users/${authState.user?.uid}/following/${userId}`))
        if(doc_.exists()) relationWithUser = 'following'
        else relationWithUser = ''
      }

      if(userCache){
        userCache.relationWithUser = relationWithUser
        return userCache
      }

      if(!userId) return null
      const user : IUserStored | undefined = (await getDoc(doc(db,`users/${userId}`))).data() as IUserStored;
      user.relationWithUser = relationWithUser

      console.log("User of this page",user)
      return user
  }
  // const getPostDetails = async (postData : IPostStored,postId:string) => {
  //   let updatedDoc : IPostSnippet = {...postData,imgUrls:["#"],postId}
  //   let urls : Promise<string>[] = []
  //   for(let i=0;i<postData.numMedia;i++){
  //     urls[i]= getDownloadURL(ref(storage,`posts/${postData.authorId}/${postId}/${i}`))
  //   }
  //   updatedDoc.imgUrls= await Promise.all(urls)
  //   console.log("Updated doc!",updatedDoc)
  //   return updatedDoc
  // }
  // const getUserPosts = async () => {
  //   if(!userId) return null
  //   const userPostsRefQuery = query(collection(db,`users/${userId}/posts`),limit(10))
  //   const userPostsSnapShot = await getDocs(userPostsRefQuery)
  //   console.log(userPostsSnapShot.docs)
  //   const promiseArr =  userPostsSnapShot.docs.map(async (postDoc) => {
  //     let postId = postDoc.id;
  //     console.log(postDoc.id , postDoc.data())
  //     let postData : IPostStored | undefined = (await getDoc(doc(db,`posts/${postId}`))).data() as IPostStored;
  //     console.log(postData)
  //     if(!postData) return null
  //     return getPostDetails(postData,postId)
  //   })
  //   return Promise.all(promiseArr)
  // }

  // useEffect(()=>{
  //   getUserData().then((userData)=>{
  //     if(userData){
  //       setUserInfo(userData)
  //     }
  //   })
  //   getUserPosts().then((postsSnippets)=>{
  //     if(postsSnippets && postsSnippets.length > 0){
  //       setUserPosts((prev)=>{
  //         console.log("Post list",[...postsSnippets,...prev])
  //         return [...postsSnippets,...prev] as IPostSnippet[]
  //       })
  //     }
  //   })

  //   if(userId === authState.user?.uid) setRelation('self');
  //   else{
  //     getDoc(doc(db,`users/${authState.user?.uid}/following/${userId}`)).then((doc)=>{
  //       if(doc.exists()) setRelation('follows')
  //       else setRelation('desntFoloow')
  //     }).catch((err)=>{
  //       console.log("While checking relation with user.. error occured!")
  //     })
  //   }
  // },[])

  const getPostIdandCacheDetails = async (postId:string) => {
      const cacheCheck = queryClient.getQueryData(['post',postId])
      if(cacheCheck){
        console.log("was here to collect.... data",postId,cacheCheck)
        return postId
      }else{
        const postData  = (await getDoc(doc(collection(db,`posts`),postId))).data() as IPostStored ;

        let updatedDoc : IPost = {...postData,imgUrls:["#"],author:{name:'',avatar:'',about:'',username:''},postId}
        let urls : Promise<string>[] = []
        for(let i=0;i<postData.numMedia;i++){
          urls[i]= getDownloadURL(ref(storage,`posts/${postData.authorId}/${postId}/${i}`))
        }
        updatedDoc.imgUrls= await Promise.all(urls)
        
        updatedDoc.hasLiked = (await getDoc(doc(collection(db,`posts/${postId}/likedby`),authState.user?.uid))).exists();
  
        console.log("Updated doc!", postData.authorId, postId, updatedDoc)
        queryClient.setQueryData(['post',postId],updatedDoc)
        return postId
      }
  }

  const getPostFromCache =  (postId:string) => {
      const post : IPost | undefined = queryClient.getQueryData(['post',postId])
      if(post){
        return post 
      }else{
        return 
      }
  }
  
  const fetchPosts = async ({pageParam = 1}) => {
    
      const q_ = (lastPostDoc.current)?(query(collection(db,`users/${userId}/posts`),orderBy('createdAt','desc'), startAfter(lastPostDoc.current),limit(postPerPage))):(query(collection(db,`users/${userId}/posts`),orderBy('createdAt','desc'),limit(postPerPage)))
      const userFeedSnapshots_ = await getDocs(q_)
      if(!firstPostDoc.current) firstPostDoc.current = userFeedSnapshots_.docs[0]
      lastPostDoc.current = userFeedSnapshots_.docs[userFeedSnapshots_.docs.length-1]
      console.log("userFeedSnapshots_",userFeedSnapshots_.docs.length , lastPostDoc.current)
      const promises = userFeedSnapshots_.docs.map(async (currDoc)=>{        
        return getPostIdandCacheDetails(currDoc.id)
      })
      const data = await Promise.all(promises)
      
      console.log("data for page",pageParam, ' :  ', data)
      
      return {data,nextPage:pageParam+1,isLast:(userFeedSnapshots_.size < postPerPage)}
  }
  const {
    isLoading,
    isError,
    error,
    data : userPostFeed,
    isFetching,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery(['user',userId,'postFeed'],fetchPosts,{
    getNextPageParam : (lastPage,pages)=>{
      if(lastPage.isLast) return undefined
      return lastPage.nextPage + 1
    },
    staleTime: Infinity,

  })
  const loader = useRef(null)
  const observerCallback = useCallback((entries : IntersectionObserverEntry[])=>{
    const target = entries[0]
    console.log("intersection!")
    if(target.isIntersecting && !isFetching){
      console.log("Is intersection!" , isFetching,hasNextPage )
      fetchNextPage()
    }
  },[loader,isFetching,fetchNextPage,hasNextPage,isLoading])

  useEffect(()=>{

    getUserData().then((userData)=>{
      if(userData){
        setUserInfo(userData)
      }
    })
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
  },[loader,observerCallback,setUserInfo])

  if(userInfo){
    return (
      <div className='w-full mx-auto h-full place-content-center' style={{width:'700px'}}>
        <div className='flex max-w-full bg-blue-100 ' >
          <img className="h-28 w-28 rounded-full"
            src={(!userInfo.avatar || userInfo.avatar==="")?"/abstract-user.svg":userInfo.avatar}
            />
          <div className='w-full pl-5 '>
            <div className='flex items-center justify-between'>
              <div className='w-full text-xl font-bold' >{userInfo.username}</div>
              <div className='w-fit min-w-fit py-2 flex items-center space-x-2 px-2'>
                {(userInfo.relationWithUser === "following") && <button
                    className={`text-black bg-gray-300 p-1 px-2 rounded-md w-fit hover:opacity-80`}
                    onClick={(event)=>{event.preventDefault(); changeUserFollowState()}}
                  >
                    Following
                </button>}
                {(userInfo.relationWithUser === "") && <button 
                    className={`text-white bg-blue-500 p-1 px-2 rounded-md w-auto hover:opacity-80`}
                    onClick={(event)=>{event.preventDefault(); changeUserFollowState()}}
                  >
                    Follow
                </button>}
                {(userInfo.relationWithUser === "self") && <Link
                    to={'/update-profile'}
                    className={`text-black bg-gray-300 p-1 px-2 rounded-md w-auto hover:opacity-80`}
                  > Edit Profile
                </Link>}
                <button>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              {userInfo.about}
            </div>
            <div className='flex justify-between w-full'>
              <div className='font-bold text-md w-full text-center'>{userInfo.numPosts} Posts</div>  
              <div className='font-bold text-md w-full text-center'>{userInfo.numStories} Stories</div> 
            </div>
          </div>
        </div>
        <div className='w-full grid grid-cols-2'>
          { 
            userPostFeed && userPostFeed.pages.map((page,pageNum)=>{
              return page.data.map((postId,index)=>{
                let post = getPostFromCache(postId)
                if(post){
                  return <div key={postId} className="p-10">
                    {postId}
                    <img src={post.imgUrls[0]} className="aspect-square w-full"/>
                  </div>
                }
              })
            })
          }
        </div>
      <div ref={loader}>This is the end</div>
      </div>
    )
  }else{
    return (
      <div>
        Loading!!!
      </div>
    )
  }
}

export default UserPage