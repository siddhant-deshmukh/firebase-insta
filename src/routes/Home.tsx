import { collection, endAt, getDocs, query } from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import { db } from '../firebase'
import { Post, PostStored } from '../types'


const Home = () => {

  const [postFeed,setPostFeed] = useState<PostStored[]>([])
  const refreshPosts = useCallback(async() => {
    const newPostsQuery = query(collection(db,'posts'),endAt(10));
    const querySnapshot = await getDocs(newPostsQuery)
    const newPosts : PostStored[] = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      newPosts.push(doc.data() as PostStored)
    });
    setPostFeed((prev)=>{
      return [...newPosts,...prev];
    })
  },[setPostFeed])
  useEffect(()=>{
    refreshPosts()
  },[])
  return (
    <div>
      Home {import.meta.env.VITE_FRONT_END_URL}
      {
        postFeed && postFeed.map((post,index)=>{
          return(
            <div key={index}>
              {JSON.stringify(post)}
            </div>
          )
        })
      }
    </div>
  )
}

export default Home