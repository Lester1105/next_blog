import PostCard from "@/components/PostCard";
import { getCollection } from "@/lib/db";


export default async function Home() {

  const postCollection = await getCollection('posts')
  const posts = await postCollection?.find().sort({ $natural:-1 }).toArray()
  
if (posts) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {
        posts.map((post)=>(
          <div key={post._id}>
          <PostCard post={post} />  
          </div>
        ))
      }
    </div>
  )
  
} else {
  
}

}
