import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { IUserSnippet } from '../types'

const UserSnippetCard = ({ author,uid } : {author : IUserSnippet | null,uid:string}) => {
  const [showPopover,setShowPopover] = useState<boolean>(false)

  if(author){
    return (
      <div className="flex w-full relative items-center px-4 py-3">
        <Link 
          className='group w-fit flex  items-center'
          to={`/u/${uid}`}
          onMouseEnter={()=>{setShowPopover(true)}}
          onMouseLeave={()=>{setShowPopover(false)}}
          >
          <img className="h-8 w-8 rounded-full"
              src={(!author.avatar || author.avatar==="")?"/abstract-user.svg":author.avatar}
              />
          <div className="ml-3 ">
              <span className="text-sm font-semibold group-hover:underline antialiased block leading-tight">{author.name}</span>
              <span className="text-gray-600 text-xs block">{author.username}</span>
          </div>

        </Link>
        <div 
          className={`${(showPopover)?"":"hidden"}  z-20 w-fit h-fit  bg-white rounded-xl border  border-gray-200 absolute left-8 top-14`}
          
          >
            <div className='flex    h-fit'>
              <div className='p-3 w-fit items-center'>
                <img className="h-16 w-16  rounded-full "
                    src={(!author.avatar || author.avatar==="")?"/abstract-user.svg":author.avatar}
                    />
              </div>
              <div className=" w-52 py-4">
                  <span className="text-sm font-semibold group-hover:underline antialiased block leading-tight">{author.name}</span>
                  <span className="text-gray-600 text-xs block">{author.username}</span>
                  <span>{author.about}</span>
              </div>
            </div>
        </div>
      </div>
    )
  }else{
    return(
      <div className="animate-pulse flex w-full items-center px-4 py-3">
          <svg className="text-gray-200 h-8 w-8 rounded-full dark:text-gray-700" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path></svg>
          <div>
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-1"></div>
              <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          </div>
      </div>
    )
  }

}

export default UserSnippetCard