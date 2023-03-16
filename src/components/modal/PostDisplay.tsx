import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import {  useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import { getPost } from '../../utils/post_related_functions';
import {  IPost } from '../../types';
import Modal_CommentComponent from './Modal_CommentComponent';
import Modal_PostComponent from './Modal_PostComponent';



export const PostDisplay = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [post, setPost] = useState<IPost | null>(null)
  

  const { authState } = useContext(AppContext)
  const postId = searchParams.get('postId')

  const queryClient = useQueryClient()

  const closeModal = useCallback(() => {
    setSearchParams((prev) => {
      // let temp_ = prev;
      prev.delete('showPostModal')
      return prev
    })
  }, [setSearchParams])



  useEffect(() => {
    if(!postId) return
    getPost(postId,queryClient,authState.user?.uid).then((value) => {
      if (value) {
        setPost(value)
      }
    })
  }, [])
  

  return (
    <div>
      {
        post && 
        <div className={`modal ${(searchParams.get('showPostModal') === 'Yes' && searchParams.get('postId')) ? "" : "hidden"} 
        overflow-x-hidden h-screen fade fixed  flex items-center top-0 left-0  w-full outline-none bg-black bg-opacity-40  overflow-y-auto`}
          id="exampleModalScrollable" tabIndex={-1} py-20 aria-labelledby="exampleModalScrollableLabel" aria-hidden="true">

          {/* Close Button */}
          <button type="button"
            className="absolute right-4 top-16 z-50 sm:top-4 btn-close box-content w-fit h-fit p-2 items-center text-black border-none rounded-full opacity-50 bg-white focus:shadow-none focus:outline-none focus:opacity-100 hover:bg-slate-100 hover:opacity-75 hover:no-underline"
            data-bs-dismiss="modal" aria-label="Close"
            onClick={(event) => { event.preventDefault(); closeModal() }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Modal with w-full*/}
          <div className="flex h-4/6 sm:h-5/6   w-full  relative mx-auto pointer-events-none" style={{ minHeight: '384px' }}>
            {/* Main Modal with w-fit*/}
            <div
              className="mx-auto h-auto border-none rounded-xl max-w-full w-fit  max-h-full  p-0.5 shadow-lg  relative  flex  pointer-events-auto bg-clip-padding  outline-none text-current"
            >
              {
                post &&
                <Modal_PostComponent post={post} />
              }
              {
                post && postId &&
                <Modal_CommentComponent postId={postId} post={post}/>
              }
            </div>
          </div>
        </div>
      }
    </div>
  )
}



export default PostDisplay;
