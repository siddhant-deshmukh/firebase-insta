import React, { useState } from 'react'
import { IComment } from '../../types';

export const CommentCard = ({ comment }: { comment: IComment }) => {
  const [shouldTruncate, setTruncate] = useState<boolean>(true)
  if (comment && comment.user) {
    return (
      <div className=' w-96  h-fit p-2  pl-3 flex'>

        <img className="h-7 w-7 rounded-full"
          src={(!comment.user.avatarUrl || comment.user.avatarUrl === "") ? "/abstract-user.svg" : comment.user.avatarUrl}
        />

        <div className='w-full h-full px-2'>
          <div className='w-full h-auto'>
            <span className="text-sm font-medium group-hover:underline antialiased block leading-tight">{comment.user.name}</span>
          </div>
          <div className=' px-1'>
            {shouldTruncate &&
              <div className='text-xs h-fit  overflow-hidden' style={{width:'296px'}}>
                {comment.text.slice(0, 50)}
                {
                  comment.text.length > 50 &&
                  <span>
                    <button className='text-blue-500 font-semibold' 
                      onClick={(event) => { event.preventDefault(); setTruncate(false) }}>...more</button>
                  </span>
                }
              </div>
            }
            {
              !shouldTruncate &&
              <div className=' text-xs h-fit w-72 overflow-hidden' style={{width:'296px'}}>
                {comment.text}
                <span>
                  <button className='text-blue-500 font-semibold'
                    onClick={(event) => { event.preventDefault(); setTruncate(true) }}>...less</button>
                </span>
              </div>
            }
          </div>
          <div className='flex w-full space-x-2'>
            <button className='text-xs text-gray-400'>{comment.numLikes} Likes</button>
            <button className='text-xs text-gray-400'> Reply</button>
          </div>
        </div>
        <div className='w-fit'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        {/* <div className='w-fit h-auto'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div> */}
      </div>
    )
  } else {
    return (<div></div>)
  }
}
