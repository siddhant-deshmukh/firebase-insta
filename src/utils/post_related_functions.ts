import { collection, deleteDoc, doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { getDownloadURL, ref } from "firebase/storage"
import { QueryClient } from "react-query"
import { db, storage } from "../firebase"
import { IPost, IPostStored } from "../types"

export async function getPost(postId: string, queryClient: QueryClient, ownUid: string | undefined) {
    const postSnap = await getDoc(doc(db, 'posts', postId))
    if (postSnap.exists()) {
        const postData = postSnap.data() as IPostStored
        await getPostsIdAndCacheDetails(postData, postId, queryClient, ownUid)
        const post: IPost | undefined = queryClient.getQueryData(['post', postId])
        return post
    } else {
        return undefined
    }
}
export async function getPostsIdAndCacheDetails(postData: IPostStored, postId: string, queryClient: QueryClient, ownUid: string | undefined) {
    try {
        // checking post in cache
        const checkPost = queryClient.getQueryData(['post', postId]) as IPost | undefined
        if (checkPost) return postId

        // if not found getting the post
        let urls: Promise<string>[] = []
        for (let i = 0; i < postData.numMedia; i++) {
            urls[i] = getDownloadURL(ref(storage, `posts/${postData.authorId}/${postId}/${i}`))
        }
        let imgUrlsPromise = Promise.all(urls)      // to get image urls of post
        // to get if user has liked it random if not
        let checkLikedPromise = async () => {
            if (ownUid) return await getDoc(doc(collection(db, `posts/${postId}/likedby`), ownUid))
            else return undefined
        }

        const [imgUrls, checkLiked] = await Promise.all([imgUrlsPromise, checkLikedPromise()])
        const finalDoc: IPost = {
            ...postData,
            imgUrls,
            hasLiked: (checkLiked) ? checkLiked.exists() : (Math.random() < 0.5),
            postId
        }
        console.log("Updated doc!", finalDoc)
        queryClient.setQueryData(['post', postId], finalDoc, {
            updatedAt: Infinity,
        })
        return postId
    } catch (err) {
        console.error("While getting post", postId, err)
        return undefined
    }
}
export const updateLikedState = async (post: IPost | null, setPost: React.Dispatch<React.SetStateAction<IPost | null>>, queryClient: QueryClient, userId: string | undefined) => {
    if (!post) return;
    if (post.hasLiked) {
      deleteDoc(doc(collection(db, `posts/${post.postId}/likedby`), userId))
        .then(() => {
          const newPost = { ...post, hasLiked: false, numLikes: (post.numLikes || 1) - 1 }
          queryClient.setQueryData(['post', post.postId], newPost)
          setPost(newPost)
        }).catch((err) => {
          console.log("Some error occured", err)
        })
    } else {
      setDoc(doc(collection(db, `posts/${post.postId}/likedby`), userId), {
        createdAt: Timestamp.fromDate(new Date())
      }).then((onFulfield) => {
        const newPost = { ...post, hasLiked: true, numLikes: (post.numLikes || 0) + 1 }
        queryClient.setQueryData(['post', post.postId], newPost)
        setPost(newPost)
      }).catch((err) => {
        console.log("Something goes wrong to change liked state", err)
      })
    }
  }