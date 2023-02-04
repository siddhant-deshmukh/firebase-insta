import { collection, doc, DocumentData, getDoc, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import { db } from '../../firebase';
import { IComment, IUserSnippet } from '../../types';
import { CommentCard } from './CommentCard';

const CommentsList = ({postId,endUserId}:{postId:string,endUserId:string}) => {
  
  const [commentsList,setCommentsList] = useState<IComment[]>([])
  const lastCommentRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [newCommentsLoading,setLoading] = useState(false)

  const getComments = async ()=>{
    setLoading(true)
    //where('authorId','!=',endUserId),
    const q = (!lastCommentRef.current)?
        query(collection(db,`posts/${postId}/comments`),
            orderBy('authorId','asc'),
            where('authorId','!=',endUserId),
            where('level','==',0),
            where('parentId','==',null),
            orderBy('createdAt','desc'),
            orderBy('numLikes','desc'),
            limit(10))
        :  query(collection(db,`posts/${postId}/comments`),
                where('authorId','!=',endUserId),
                where('level','==',0),
                where('parentId','==',null),
                orderBy('authorId','asc'),
                orderBy('createdAt','desc'),
                orderBy('numLikes','desc'),
                startAfter(lastCommentRef.current),
                limit(10));
    
    const docsSnapShot = await getDocs(q);
    console.log(docsSnapShot.docs)
    lastCommentRef.current = docsSnapShot.docs[docsSnapShot.docs.length -1]

    const promiseQ = docsSnapShot.docs.map(async (commentDoc)=>{
        let user = (await getDoc(doc(db,`users/${commentDoc.data().authorId}`))).data() as IUserSnippet;   
        //console.log("commentId",commentDoc.id,user)
        return {commentId : commentDoc.id , ...commentDoc.data(),user} as IComment
    })
    const commets =  await Promise.all(promiseQ)
    console.log("commets", commets  )
    setLoading(false)
    return commets
  }
  const fetchMore = () => {
    getComments().then((newComments)=>{
        setCommentsList((prev)=>{
            return [...prev,...newComments]
        })
    })
  }
  useEffect(()=>{
    fetchMore()
  },[])
  return (
    <div className='w-full h-fit' >
        {
            commentsList && 
            commentsList.map((comment)=>{
                return <div key={comment.commentId}>
                    <CommentCard comment={comment}/>
                </div>
            })
        }
        <div className='w-full flex place-content-center h-fit' hidden={newCommentsLoading}>
          <button 
            className='w-fit h-fit mx-auto bg-slate-100'
            onClick={(event)=>{event.preventDefault(); fetchMore()}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <div hidden={!newCommentsLoading}>
            Loading ......
        </div>
    </div>
  )
}

export default CommentsList