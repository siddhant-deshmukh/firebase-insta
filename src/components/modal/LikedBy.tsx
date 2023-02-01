import { collection, getDoc, getDocs, limit, orderBy, query, doc } from 'firebase/firestore';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { db } from '../../firebase';
import { IUserSnippet } from '../../types';

export const LikedBy = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [userSnippets,setUserSnippets] = useState<IUserSnippet[]>([]);

  const closeModal = useCallback(()=>{
    setSearchParams((prev)=>{
        // let temp_ = prev;
        prev.delete('likedByModal')
        return prev
    })
  },[setSearchParams])
  const postId = searchParams.get('postId')
  
  const getUserSnippets = useCallback(async ()=>{
    const q = query(collection(db,`posts/${postId}/likedby`),orderBy('createdAt'),limit(10));
    const docsSnapShot = await getDocs(q);
    
    const promiseQ = docsSnapShot.docs.map(async (userDoc)=>{
      console.log("userId",userDoc.id)
      return (await getDoc(doc(db,`users/${userDoc.id}`))).data() as IUserSnippet;
    })
    const snippets =  await Promise.all(promiseQ)
    console.log("snippets", snippets  )
    return snippets
  },[setUserSnippets])

  useEffect(()=>{
    getUserSnippets().then((snippets)=>{
      setUserSnippets((prev)=>{
        console.log("userSnippets", [...snippets,...prev])
        return [...snippets,...prev];
      })
    })
  },[])

  return (
    <div>
        <div className={`modal ${(searchParams.get('likedByModal')==='Yes'  && searchParams.get('postId'))?"":"hidden"} overflow-x-hidden h-screen fade fixed  flex items-center top-0 left-0  w-full outline-none bg-black bg-opacity-40  overflow-y-auto`}
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
                  onClick={(event)=>{event.preventDefault(); closeModal() }}>
                      X
                  </button>
              </div>
              <div className="modal-body flex flex-col relative p-0.5 overflow-y-auto h-full w-full">
                {
                  userSnippets &&
                  userSnippets.map((user)=>{
                    return <div key={user.username} className="flex items-center w-full px-4 py-3" max-w-md>
                      <div className='group w-fit flex items-center'>
                          <img 
                            className="h-8 w-8 rounded-full" 
                            src={(!user.avatar || user.avatar==="")?"/abstract-user.svg":user.avatar}
                            />
                          <div className="ml-3 ">
                              <span className="text-sm font-semibold group-hover:underline antialiased block leading-tight">{user.name}</span>
                              <span className="text-gray-600 text-xs block">{user.username}</span>
                          </div>
                      </div>
                    </div>
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