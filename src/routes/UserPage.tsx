import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, limit, orderBy, query, QueryDocumentSnapshot, setDoc, startAfter } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { QueryClient, useInfiniteQuery, useQueryClient } from 'react-query';
import { Link, useParams } from 'react-router-dom'
import PostTitleCard from '../components/Post/PostTitleCard';
import AppContext, { getUserData } from '../context/AppContext';
import { db } from '../firebase';
import Loader from '../Loader';
import { IPost, IPostStored, IUserSnippet } from '../types';
import { getPostsIdAndCacheDetails } from './Home';

export const changeUserFollowState = (userInfo: IUserSnippet | null, setUserInfo: React.Dispatch<React.SetStateAction<IUserSnippet | null | undefined>>, queryClient: QueryClient, userId: string | undefined) => {
  //console.log("Here!!!!!!!!!!11", userInfo)
  try {
    if (!userInfo) return;
    if (userInfo.relationWithUser === "self") return;

    if (userInfo.relationWithUser === 'following') {
      console.log(`users/${userId}/following/${userInfo.uid}`)
      deleteDoc(doc(db, `users/${userId}/following/${userInfo.uid}`))
        .then((value) => {
          console.log("Sucessfully updated state!", value)
          setUserInfo((prev) => {
            if (prev)
              return { ...prev, relationWithUser: '', numFollowers: prev.numFollowers || 1 - 1 };
            else return null
          })
        }).catch((err) => {
          console.log("error in unfollowing!", err)
        })
    } else {
      setDoc(doc(db, `users/${userId}/following/${userInfo.uid}`), {
        exists: true
      }).then((value) => {
        console.log("Sucessfully updated state!", value)
        setUserInfo((prev) => {
          if (prev)
            return { ...prev, relationWithUser: 'following', numFollowers: prev.numFollowers || 0 + 1 };
          else return null
        })
      })
    }
  } catch (err) {
    console.error("while changing follow state", err)
  }
}

const UserPage = () => {

  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState<IUserSnippet | undefined | null>(undefined);
  // const [relation,setRelation] = useState<'self' | 'follows' | 'desntFoloow' | null>(null)
  const queryClient = useQueryClient()
  const { authState } = useContext(AppContext)
  const postPerPage = 10
  const firstPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const lastPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fetchPosts = async ({ pageParam = 1 }) => {
    // const q_ = (lastPostDoc.current)? 
    // (query(collection(db, `users/${userId}/posts`), orderBy('createdAt', 'desc'), startAfter(lastPostDoc.current), limit(postPerPage))) :
    const q_ = query(collection(db, `users/${userId}/posts`), limit(postPerPage))
    // console.log("query", userId, q_)
    const userFeedSnapshots_ = await getDocs(q_)
    if (!firstPostDoc.current) firstPostDoc.current = userFeedSnapshots_.docs[0]
    lastPostDoc.current = userFeedSnapshots_.docs[userFeedSnapshots_.docs.length - 1]
    console.log("userFeedSnapshots_", userFeedSnapshots_.docs.length, lastPostDoc.current)

    const promises = userFeedSnapshots_.docs.map(async (currDoc) => {
      const postDoc = (await getDoc(doc(db, `posts/${currDoc.id}`))).data() as IPostStored
      return getPostsIdAndCacheDetails(postDoc, currDoc.id, queryClient, authState.user?.uid)
    })
    const data = await Promise.all(promises)

    //console.log("data for page", pageParam, ' :  ', data)

    return { data, nextPage: pageParam + 1, isLast: (userFeedSnapshots_.size < postPerPage) }
  }
  const {
    isLoading,
    isError,
    error,
    data: userPostFeed,
    isFetching,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery(['user', userId, 'postFeed'], fetchPosts, {
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.isLast) return undefined
      return lastPage.nextPage + 1
    },
    staleTime: Infinity,
    retry: 2
  })
  const loader = useRef(null)
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    console.log("intersection!")
    if (target.isIntersecting && !isFetching) {
      console.log("Is intersection!", isFetching, hasNextPage)
      fetchNextPage()
    }
  }, [loader, isFetching, fetchNextPage, hasNextPage, isLoading])

  useEffect(() => {
    if (userId) {
      getUserData(userId, queryClient, authState.user?.uid).then((userData) => {
        if (userData) {
          setUserInfo(userData)
          setErrorMsg(null)
        } else {
          setUserInfo(null)
          setErrorMsg("User not found")
        }
      })
    }
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.25
    })
    //@ts-ignore
    if (loader && loader.current) observer.observe(loader.current);
    return () => {
      //@ts-ignore
      if (loader.current) observer.unobserve(loader.current);
    }
  }, [loader, observerCallback, setUserInfo])

  if (userInfo && !errorMsg) {
    return (
      <div className='w-full mx-auto h-full place-content-center ' style={{ maxWidth: '800px' }} >
        <div className="lg:mx-2 mb-8">
          <header className="flex flex-wrap items-center h-fit p-2 md:py-8">
            <div className="md:w-3/12 md:ml-16 h-fit">
              {/* <!-- profile image --> */}
              <img className="w-20 h-20 sm:w-24 sm:h-24  md:w-40 md:h-40 object-cover rounded-full p-1"
                src={userInfo.avatarUrl || '/abstract-user.svg'} alt="profile" />
            </div>
            {/* <!-- profile meta --> */}
            <div className="w-9/12 md:w-7/12 ml-2 h-fit sm:ml-4">
              <div className="md:flex md:flex-wrap md:items-center mb-4 flex justify-between">
                <h2 className="text-xl md:text-3xl  inline-block font-light md:mr-2 sm:mb-0">
                  {userInfo.username}
                </h2>
                {userInfo.relationWithUser === '' && <button className="bg-blue-500 px-2 py-1 
                    text-white font-semibold text-sm rounded  text-center 
                    sm:inline-block "
                  onClick={(event) => { event.preventDefault(); changeUserFollowState(userInfo, setUserInfo, queryClient, authState.user?.uid) }}>Follow</button>}
                {userInfo.relationWithUser === 'following' && <button className="bg-gray-300 px-2 py-1 
                    text-gray-500 font-semibold text-sm rounded  text-center 
                    sm:inline-block "
                  onClick={(event) => { event.preventDefault(); changeUserFollowState(userInfo, setUserInfo, queryClient, authState.user?.uid) }}>Following</button>}
                {userInfo.relationWithUser === 'self' && <Link to="/update-profile" className="bg-gray-300  px-2 py-1 
                    text-gray-500 font-semibold text-sm rounded  text-center 
                    sm:inline-block">Edit Profile</Link>}
              </div>

              {/* <!-- post, following, followers list for medium screens --> */}
              <ul className="hidden md:flex space-x-8 mb-4">
                <li>
                  <span className="font-semibold">{userInfo.numPosts} </span>
                  posts
                </li>

                <li>
                  <span className="font-semibold">{userInfo.numFollowers || 0} </span>
                  followers
                </li>
                <li>
                  <span className="font-semibold">{userInfo.numFollowing || 0} </span>
                  following
                </li>
              </ul>

              {/* <!-- user meta form medium screens --> */}
              <div className="hidden md:block">
                <h1 className="font-semibold">{userInfo.name}</h1>
                <span className='whitespace-pre-wrap'>{userInfo.about}</span>
              </div>

            </div>
            {/* <!-- user meta form small screens --> */}
            <div className="md:hidden text-sm my-2">
              <h1 className="font-semibold">{userInfo.name}</h1>
              <span className='whitespace-pre-wrap' >{userInfo.about}</span>
            </div>

          </header>

          {/* <!-- posts --> */}
          <div className="px-px md:px-3">

            {/* <!-- user following for mobile only --> */}
            <ul className="flex md:hidden justify-around space-x-8 border-t 
            text-center p-2 text-gray-600 leading-snug text-sm">
              <li>
                <span className="font-semibold text-gray-800 block">{userInfo.numPosts}</span>
                posts
              </li>

              <li>
                <span className="font-semibold text-gray-800 block">{userInfo.numFollowers || 0}</span>
                followers
              </li>
              <li>
                <span className="font-semibold text-gray-800 block">{userInfo.numFollowing || 0}</span>
                following
              </li>
            </ul>

            {/* <!-- insta freatures --> */}
            <ul className="flex items-center justify-around md:justify-center space-x-12  
                uppercase tracking-widest font-semibold text-xs text-gray-600
                border-t">
              {/* <!-- posts tab is active --> */}
              <li className="md:border-t md:border-gray-700 md:-mt-px md:text-gray-700">
                <a className="inline-block p-3" href="#">
                  <i className="fas fa-th-large text-xl md:text-xs"></i>
                  <span className="hidden md:inline">post</span>
                </a>
              </li>
              <li>
                <a className="inline-block p-3" href="#">
                  <i className="far fa-square text-xl md:text-xs"></i>
                  <span className="hidden md:inline">igtv</span>
                </a>
              </li>
              <li>
                <a className="inline-block p-3" href="#">
                  <i className="fas fa-user border border-gray-500
                         px-1 pt-1 rounded text-xl md:text-xs"></i>
                  <span className="hidden md:inline">tagged</span>
                </a>
              </li>
            </ul>
            {/* <!-- flexbox grid --> */}

          </div>
          <div className="w-full h-auto  grid grid-cols-3 gap-3">
            {/* <!-- post 1--> */}
            {
              isLoading && <div className='w-fit mx-auto'><Loader /></div>
            }
            {
              isError && <div className='w-fit mx-auto'><div className="w-96 h-fit bg-red-100" style={{ maxWidth: '60%' }}>
                <img src="https://i.imgur.com/qIufhof.png" className='w-full aspect-square' />

                <h1 className='w-full py-4 text-xl font-bold text-center'>
                  Internal server error
                </h1>
                <p className="text-blue-500 underline">
                  try to <Link to={'/'}>Refresh</Link>
                </p>
              </div>
              </div>
            }
            {
              userPostFeed?.pages.map((page, pageNum) => {
                return page.data.map((postId, index) => {
                  let post = queryClient.getQueryData(['post', postId]) as IPost
                  // console.log(index, postId, post)
                  return (<div key={postId} className="w-full border-gray-300 border overflow-hidden aspect-square">
                    <PostTitleCard post={post} />
                  </div>)
                })
              })
            }
          </div>
        </div>
      </div>
    )
  } else if (userInfo === undefined && !errorMsg) {
    return (
      <div className='w-fit mx-auto'>
        <Loader />
      </div>
    )
  } else {
    return (
      <div className='w-fit mx-auto'>
        <div className="w-96 h-fit bg-red-100" style={{ maxWidth: '60%' }}>
          <img src="https://i.imgur.com/qIufhof.png" className='w-full aspect-square' />

          <h1 className='w-full py-4 text-xl font-bold text-center'>
            User not found
          </h1>
          <p className="text-blue-500 underline">
            <Link to={'/'}>Get back to home</Link>
          </p>
        </div>
      </div>
    )
  }
}


export default UserPage