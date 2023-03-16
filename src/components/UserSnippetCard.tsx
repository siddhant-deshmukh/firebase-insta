import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { IUserSnippet } from '../types'

const UserSnippetCard = ({ author }: { author: IUserSnippet | null | undefined }) => {
  if (author) {
    return (
      <div className="flex w-full relative items-center px-3 py-2 border border-gray-200">
        <div className='w-fit group h-full'>
          <Link to={`/u/${author.uid}`}
            className=' w-fit flex  items-center'
            // onMouseEnter={() => { setShowPopover(true) }}
            // onMouseLeave={() => { setShowPopover(false) }}
          >
            <img className="h-8 w-8 rounded-full"
              src={(!author.avatarUrl || author.avatarUrl === "") ? "/abstract-user.svg" : author.avatarUrl}
            />
            <div className="ml-3 ">
              <span className="text-sm font-semibold group-hover:underline antialiased block leading-tight">{author.name}</span>
              {/* <span className="text-gray-600 text-xs block">{author.username}</span> */}
            </div>

          </Link>
          <div
            className={` w-80 z-20 hidden group-hover:block  h-fit  bg-gray-100 rounded-xl border  border-gray-200 absolute left-8 top-10`}
            // onMouseEnter={()=>{setShowPopover(true)}} ${(showPopover) ? "" : "hidden"}
            // onMouseLeave={()=>{setShowPopover(false)}}
            >
            <div className="flex flex-wrap w-full items-center p-1 ">
              <div className="flex items-center w-full space-x-1">
                {/* <!-- profile image --> */}
                <div className='block' style={{ width: '30%' }}>
                  <img className="w-20 h-20 border border-black object-cover rounded-full p-1"
                    src={(!author.avatarUrl || author.avatarUrl === "") ? "/abstract-user.svg" : author.avatarUrl} alt="profile" />
                </div>
                <div className=" " style={{ width: '70%' }}>
                  <div className='flex w-full items-center justify-between space-x-2 pr-3'>
                    <h2 className="text-base h-full inline-block font-semibold">
                      {author.username}
                    </h2>
                    {author.relationWithUser === '' && <Link to={`/u/${author.uid}`}
                      className="bg-blue-500 px-2 py-1 text-white z-30 font-semibold text-sm rounded  text-center  sm:inline-block "
                      >Follow</Link>}
                    {/* changeUserFollowState() */}
                    {author.relationWithUser === 'following' && <Link to={`/u/${author.uid}`}
                      className="bg-gray-300 px-2 py-1  z-30 text-gray-500 font-semibold text-sm rounded  text-center sm:inline-block "
                      >Following</Link>}
                  </div>

                  <div className="text-sm ">
                    <h1 className="font-normal">{author.name}</h1>
                    <p className='font-light whitespace-pre-wrap'>{author.about.slice(0, 200)}</p>
                  </div>
                </div>
              </div>
              <ul className="flex w-full justify-around space-x-8 border-t 
              text-center p-2 text-gray-600 leading-snug text-sm">
                <li>
                  <span className="font-semibold text-gray-800 block">{author.numPosts}</span>
                  posts
                </li>

                <li>
                  <span className="font-semibold text-gray-800 block">{author.numFollowers || 0}</span>
                  followers
                </li>
                <li>
                  <span className="font-semibold text-gray-800 block">{author.numFollowing || 0}</span>
                  following
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
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