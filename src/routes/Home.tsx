import { QueryClient, useQueryClient } from 'react-query'
import { collection, doc, DocumentData, endAt, getDoc, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import { Post } from '../components/Post/Post'
import AppContext from '../context/AppContext'
import { db, storage } from '../firebase'
import { IPost, IPostStored } from '../types'
import { Link } from 'react-router-dom'
import Loader from '../Loader'
import { getPostsIdAndCacheDetails } from '../utils/post_related_functions'

const Home = () => {

  // const [postFeed,setPostFeed] = useState<IPost[]>([])
  const { authState } = useContext(AppContext)
  const postPerPage = 3
  const firstPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const lastPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const queryClient = useQueryClient()
  
  const fetchPosts = async ({ pageParam = 1 }) => {

    const q_ = (lastPostDoc.current) ? (query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastPostDoc.current), limit(postPerPage))) : (query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(postPerPage)))
    const postFeedSnapshots_ = await getDocs(q_)
    if (!firstPostDoc.current) firstPostDoc.current = postFeedSnapshots_.docs[0]
    lastPostDoc.current = postFeedSnapshots_.docs[postFeedSnapshots_.docs.length - 1]
    const promises = postFeedSnapshots_.docs.map(async (doc) => {

      const checkPostInCache = queryClient.getQueriesData(['post', doc.id])
      console.log(checkPostInCache, 'post', doc.id)

      let docData = { ...doc.data() } as IPostStored;
      //console.log(doc.id,doc.data())
      return getPostsIdAndCacheDetails(docData, doc.id, queryClient, authState.user?.uid)
    })
    const data = await Promise.all(promises)

    console.log("data for page", pageParam, ' :  ', data)

    return { data, nextPage: pageParam + 1, isLast: (postFeedSnapshots_.size < postPerPage) }
  }
  const {
    isLoading,
    isError,
    error,
    data: postFeed,
    isFetching,
    fetchNextPage,
    hasNextPage,
    refetch
  } = useInfiniteQuery('postFeed', fetchPosts, {
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.isLast) return undefined
      return lastPage.nextPage + 1
    },
    staleTime: Infinity,

  })

  // useEffect(()=>{
  //   //refreshPosts()

  // },[])
  const loader = useRef(null)
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target.isIntersecting && !isFetching) {
      console.log("Is intersection!", isFetching, hasNextPage)
      fetchNextPage()
    }
  }, [loader, isFetching, fetchNextPage, hasNextPage, isLoading])
  useEffect(() => {
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
  }, [loader, observerCallback])

  useEffect(()=>{
    if(error) console.error('Something is wrong with useInfiniteQuery',error)
  },[error])
  
  return (
    <div className='overflow-y-hidden mx-auto w-fit'>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="w-96 h-fit bg-red-100" style={{ maxWidth: '60%' }}>
          <img src="https://i.imgur.com/qIufhof.png" className='w-full aspect-square' />

          <h1 className='w-full py-4 text-xl font-bold text-center'>
            Internal server error
          </h1> 
          <p className="text-blue-500 underline">
            try to <Link to={'/'}>Refresh</Link>
          </p>
        </div>
      ) : (
        //@ts-ignore
        <div className='py-2 flex flex-col space-y-2' style={{ maxWidth: '450px' }}>
          {
            postFeed && postFeed.pages.map((page) => {
              return page.data.map((postId) => {
                if(!postId) return <div hidden key={Math.random()}></div>
                return <Post key={postId} postId={postId} />
              })
            })
          }
        </div>
      )}
      <div ref={loader}></div>
    </div>
  )
}


export default Home