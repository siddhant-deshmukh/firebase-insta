import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppContext from '../context/AppContext';
import { db, storage } from '../firebase';
import { IPost, IPostSnippet, IPostStored, IUserSnippet, IUserStored } from '../types';

const UserPage = () => {
  
  const { userId } = useParams();
  const [userInfo,setUserInfo] = useState<IUserStored | null>(null);
  const [userPosts,setUserPosts] = useState<IPostSnippet[]>([]);
  const [relation,setRelation] = useState<'self' | 'follows' | 'desntFoloow' | null>(null)

  const {authState} = useContext(AppContext)

  const changeUserFollowState = useCallback( () =>{
    if(!relation || !userInfo || relation==='self') return
    const selfId = authState.user?.uid
    console.log(relation)
    if(relation === 'desntFoloow'){
      setDoc(doc(db,`users/${selfId}/following/${userId}`),{
        exists : true
      }).then((value)=>{
          console.log("Sucessfully updated state!",value)
          setRelation('follows')
        })
    }else{
      console.log(`users/${selfId}/following/${userId}`)
      deleteDoc(doc(db,`users/${selfId}/following/${userId}`))
        .then((value)=>{
          console.log("Sucessfully updated state!",value)
          setRelation('desntFoloow')
        }).catch((err)=>{
          console.log("error in unfollowing!",err)
        })
    }
  },[relation,setRelation])

  const getUserData = async ()=>{
    if(!userId) return null
    const user : IUserStored | undefined = (await getDoc(doc(db,`users/${userId}`))).data() as IUserStored;
    console.log("User of this page",user)
    return user
  }
  const getPostDetails = async (postData : IPostStored,postId:string) => {
    let updatedDoc : IPostSnippet = {...postData,imgUrls:["#"],postId}
    let urls : Promise<string>[] = []
    for(let i=0;i<postData.numMedia;i++){
      urls[i]= getDownloadURL(ref(storage,`posts/${postData.authorId}/${postId}/${i}`))
    }
    updatedDoc.imgUrls= await Promise.all(urls)
    console.log("Updated doc!",updatedDoc)
    return updatedDoc
  }
  const getUserPosts = async () => {
    if(!userId) return null
    const userPostsRefQuery = query(collection(db,`users/${userId}/posts`),limit(10))
    const userPostsSnapShot = await getDocs(userPostsRefQuery)
    console.log(userPostsSnapShot.docs)
    const promiseArr =  userPostsSnapShot.docs.map(async (postDoc) => {
      let postId = postDoc.id;
      console.log(postDoc.id , postDoc.data())
      let postData : IPostStored | undefined = (await getDoc(doc(db,`posts/${postId}`))).data() as IPostStored;
      console.log(postData)
      if(!postData) return null
      return getPostDetails(postData,postId)
    })
    return Promise.all(promiseArr)
  }
  useEffect(()=>{
    getUserData().then((userData)=>{
      if(userData){
        setUserInfo(userData)
      }
    })
    getUserPosts().then((postsSnippets)=>{
      if(postsSnippets && postsSnippets.length > 0){
        setUserPosts((prev)=>{
          console.log("Post list",[...postsSnippets,...prev])
          return [...postsSnippets,...prev] as IPostSnippet[]
        })
      }
    })

    if(userId === authState.user?.uid) setRelation('self');
    else{
      getDoc(doc(db,`users/${authState.user?.uid}/following/${userId}`)).then((doc)=>{
        if(doc.exists()) setRelation('follows')
        else setRelation('desntFoloow')
      }).catch((err)=>{
        console.log("While checking relation with user.. error occured!")
      })
    }
  },[])
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
              <div className='w-fit py-2 flex items-center space-x-1 px-2'>
                {(relation === "follows") && <button
                    className={`text-black bg-gray-300 p-1 px-2 rounded-md`}
                    onClick={(event)=>{event.preventDefault(); changeUserFollowState()}}
                  >
                    Following
                </button>}
                {(relation === "desntFoloow") && <button
                    className={`text-white bg-blue-500 p-1 px-2 rounded-md`}
                    onClick={(event)=>{event.preventDefault(); changeUserFollowState()}}
                  >
                    Follow
                </button>}
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
        <div className='w-full grid grid-cols-3'>
          {
            userPosts?.map((post)=>{
              return(
                <div key={post.postId}>
                  <img src={post.imgUrls[0]} className="aspect-square w-full"/>
                </div>
              )
            })
          }
        </div>
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