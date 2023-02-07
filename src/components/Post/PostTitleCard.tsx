import React from 'react'
import { Link } from 'react-router-dom'
import { IPost } from '../../types'

const PostTitleCard = ({post}:{post:IPost}) => {
    return (
        <Link to={`/p/${post.postId}`}>
        <div className="block text-white relative w-full h-full  pb-full md:mb-6">
            {/* Black background  */}
            <div className="bg-black flex  justify-center text-white font-semibold  items-center space-x-4 h-full">
                <div className='flex w-fit items-center mx-auto space-x-12'>
                <span className="items-center flex w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill={'white'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 mx-1 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                {post.numLikes}
                </span>
    
                <span className="items-center flex w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill={'white'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 mx-1 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>

                    {post.numComments || 0}
                </span>
                </div>
            </div>
            {/* <!-- post image--> */}
            <div className='absolute inset-0 '>
                <img className="w-full aspect-square bg-white overflow-y-hidden hover:opacity-50 " src={post.imgUrls[0]} alt="image" />
            </div>
        </div>
        </Link>
      )
}

export default PostTitleCard