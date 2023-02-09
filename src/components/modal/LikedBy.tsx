import { collection, getDoc, getDocs, limit, orderBy, query, doc, QueryDocumentSnapshot, DocumentData, startAt, startAfter } from 'firebase/firestore';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import AppContext, {  getUserSnippetsFromDocsSnapShot } from '../../context/AppContext';
import { db } from '../../firebase';
import { IUserSnippet, IUserStored } from '../../types';
import UserSnippetCard from '../UserSnippetCard';

export const LikedBy = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [userSnippets, setUserSnippets] = useState<(IUserSnippet | undefined)[]>([]);
  const queryClient = useQueryClient()
  const { authState } = useContext(AppContext)
  const lastCommentRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)

  const closeModal = useCallback(() => {
    setSearchParams((prev) => {
      // let temp_ = prev;
      prev.delete('likedByModal')
      return prev
    })
  }, [setSearchParams])
  const postId = searchParams.get('postId')

  const getUserSnippets =async () => {
    try{
      const q = (!lastCommentRef.current) ? 
        query(collection(db, `posts/${postId}/likedby`), orderBy('createdAt'), limit(10)):
        query(collection(db, `posts/${postId}/likedby`), startAfter(lastCommentRef.current), orderBy('createdAt'), limit(10))
    
      const docsSnapShot = await getDocs(q);

      const snippets = await getUserSnippetsFromDocsSnapShot(docsSnapShot,queryClient,authState.user?.uid)
      console.log("snippets", snippets,docsSnapShot.docs)
      return snippets
    } catch(err){
      console.error('Error while getting snippets',err)
      return []
    }
  }

  useEffect(() => {
    getUserSnippets().then((snippets) => {
      setUserSnippets((prev) => {
        prev = prev.filter((ele)=>(ele))
        console.log("userSnippets", [...snippets, ...prev])
        return [...snippets, ...prev];
      })
    })
  }, [])

  return (
    <div>
      <div className={`modal ${(searchParams.get('likedByModal') === 'Yes' && searchParams.get('postId')) ? "" : "hidden"} overflow-x-hidden h-screen fade fixed  flex items-center top-0 left-0  w-full outline-none bg-black bg-opacity-40  overflow-y-auto`}
        id="exampleModalScrollable" tabIndex={-1} py-20 aria-labelledby="exampleModalScrollableLabel" aria-hidden="true">
        <div className="modal-dialog  modal-dialog-scrollable flex flex-col max-h-screen  relative mx-auto w-fit    pointer-events-none">
          <div
            className="modal-content mx-auto border-none rounded-xl max-w-4xl  max-h-full w-80 h-96 p-0.5 shadow-lg  relative  flex flex-col  pointer-events-auto bg-white bg-clip-padding  outline-none text-current"
            >
            <div
              className="modal-header flex bg-white  w-full flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
              <h5 className="text-xl  font-medium leading-normal text-gray-800" id="exampleModalScrollableLabel">
                Liked By
              </h5>
              <button type="button"
                className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                data-bs-dismiss="modal" aria-label="Close"
                onClick={(event) => { event.preventDefault(); closeModal() }}>
                X
              </button>
            </div>
            <div className="modal-body flex flex-col relative p-0.5 overflow-y-auto h-full w-full">
              {
                userSnippets &&
                userSnippets.map((user) => {
                  if(user){
                    return <div key={user?.username} className="flex items-center w-full px-4 py-3" max-w-md>
                      <UserSnippetCard author={user} />
                    </div>
                  }
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LikedBy;