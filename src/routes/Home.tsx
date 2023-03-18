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
import Loader from '../components/Loader'
import { getPostsIdAndCacheDetails } from '../utils/post_related_functions'

const Home = () => {

  const { authState, postFeed, setPostFeed } = useContext(AppContext)

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isFetching, setFetching] = useState<boolean | null>(null)
  const [isLast, setIsLast] = useState<boolean>(false)

  const postPerPage = 4
  const firstPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const lastPostDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const queryClient = useQueryClient()
  


  const fetchNextPage = useCallback(async () => {
    if(isLast){
      console.log("Is last!!!!!!")
      return;
    }
    console.log("Here to fetch next page but .....")
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

    console.log("data for page", ' :  ', data)
    if(data.length < postPerPage || data[0]===postFeed[0]){
      console.log('----------------         lessssssssssss      -----------------------')
      setIsLast(true)
    }
    //@ts-ignore
    setPostFeed((prev) => {
      return [...prev,...data]
    })
  }, [postFeed])

  const load_more = useRef(null)
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if(isLast) return;
    console.log("Is intersection!", isFetching)
    if (target.isIntersecting && (isFetching === null || isFetching === false) ) {
      setFetching(true)
    }
  }, [load_more, isFetching, fetchNextPage, isLoading])

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.25
    })
    console.log("load_more",load_more.current)
    if (load_more && load_more.current) observer.observe(load_more.current);
    return () => {
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
      //@ts-ignore
      if (load_more.current) observer.unobserve(load_more.current);
    }
  }, [])

  useEffect(() => {
    console.log("Infinite loop!!",isFetching,postFeed)
    if(isFetching){
      fetchNextPage()
        .catch((error) => {
          setError(error)
        })
        .finally(() => {
          setTimeout(function() {
            setFetching(false)
          }, 1000);
        })
    }
  }, [isFetching])

  useEffect(() => {
    if (error) console.error('Something is wrong with useInfiniteQuery', error)
  }, [error])

  return (
    <div className='mx-auto w-fit'>
      {
        error &&
        <div className="flex items-center py-1 px-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium w-full">{error}</span>
          <button
            onClick={(event) => { event.preventDefault(); setError(null) }}
            className='w-fit rounded-full px-1.5 py-0.5 hover:bg-red-300 '>
            X
          </button>
        </div>
      }
      {isLoading ? (
        <Loader />
      ) : (
        //@ts-ignore
        <div className='py-2 flex flex-col space-y-2' style={{ maxWidth: '450px' }}>
          {
            postFeed && postFeed.map((postId) => {
              if (!postId) return <div hidden key={Math.random()}></div>
              return <Post key={postId} postId={postId} />
            })
          }
        </div>
      )}
      {
        isFetching &&
        <div className='w-full'>
          <Loader />
        </div>
      }
      {!isLast && <div className='mb-3' ref={load_more}></div>}
      {/* <div>.</div> */}
    </div>
  )
}


export default Home