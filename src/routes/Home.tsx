import { collection, doc, endAt, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import React, { useCallback, useEffect, useState } from 'react'
import { Post } from '../components/Post/Post'
import { db, storage } from '../firebase'
import { IPost, IPostStored, IUser, IUserSnippet } from '../types'


const Home = () => {

  const [postFeed,setPostFeed] = useState<IPost[]>([])
  const refreshPosts = useCallback(async() => {
    const newPostsQuery = query(collection(db,'posts'),orderBy("createdAt", "desc"), limit(10));
    const documentSnapshots = await getDocs(newPostsQuery)

    const getPostDetails = async (postData : IPostStored,postId:string) => {
      let updatedDoc : IPost = {...postData,imgUrls:["#"],author:{name:'',avatar:'',about:'',username:''},postId}
      let urls : Promise<string>[] = []
      for(let i=0;i<postData.numMedia;i++){
        urls[i]= getDownloadURL(ref(storage,`posts/${postData.authorId}/${postId}/${i}`))
      }
      updatedDoc.imgUrls= await Promise.all(urls)
      updatedDoc.author = (await getDoc(doc(db,`users/${postData.authorId}`))).data() as IUserSnippet;
      console.log("Updated doc!",updatedDoc)
      return updatedDoc
    }

    const promises = documentSnapshots.docs.map( async (doc) => {
      console.log(doc.id, " => ", doc.data());
      let docData = {...doc.data()} as IPostStored;
      return getPostDetails(docData,doc.id)
    });
    Promise.all(promises).then(( results  )=>{
      console.log("Promise results",results)
      setPostFeed((prev)=>{
        results.concat(prev)
        console.log(results)
        return results;
      })
    })
  },[setPostFeed])

  

  useEffect(()=>{
    refreshPosts()
  },[])
  return (
    <div className='overflow-y-hidden'>
      Home {import.meta.env.VITE_FRONT_END_URL}
      What is going on!
      {
        postFeed && postFeed.map((post,index)=>{
          return(
            <div key={post.postId || index}>
              <Post post={post}/>
            </div>
          )
        })
      }
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
        "avatar": "",
        "username": "2019b87345",
        "about": ""
    }
}
 */
export default Home