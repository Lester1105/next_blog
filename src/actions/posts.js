"use server"

import { getCollection } from "@/lib/db";
import getAuthUser from "@/lib/getAuthUser";
import { BlogPostSchema } from "@/lib/rules";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function createPosts(state,formData) {
    //check if user is signed in
const user = await getAuthUser();
if(!user) return redirect("/");

    //validate form fields
    const title = formData.get('title');
    const content = formData.get('content');
const validatedFields = BlogPostSchema.safeParse({
   title,
   content, 
});

    //if any form fields are invalid
    if(!validatedFields.success){
        return {
            errors:validatedFields.error.flatten().fieldErrors,
            title,
            content,
        }
    }

    //save the new post in db
try {
    const postCollection = await getCollection("posts")
    const post ={
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        userID:ObjectId.createFromHexString(user.userID)
    }
    await postCollection.insertOne(post)
} catch (error) {
    return {
        errors:{title: error.message}
    };
    
}
   
    redirect('/dashboard')
}

export async function updatePost(state,formData) {
    //check if user is signed in
const user = await getAuthUser();
if(!user) return redirect("/");

    //validate form fields
    const title = formData.get('title');
    const content = formData.get('content');
    const postId = formData.get("postId");
const validatedFields = BlogPostSchema.safeParse({
   title,
   content, 
});

    //if any form fields are invalid
    if(!validatedFields.success){
        return {
            errors:validatedFields.error.flatten().fieldErrors,
            title,
            content,
        }
    }
    //find the post
    const postCollection = await getCollection("posts");
    const post = await postCollection.findOne({_id:ObjectId.createFromHexString(postId),});

    //check the user owns the post
    if (user.userId !==post.userId) return redirect("/");
  
    //update the  post in db
    postCollection.findOneAndUpdate({ _id: post._id },{
        $set: {
            title: validatedFields.data.title,
            content: validatedFields.data.content,
        }
    })

   //redirect
    redirect('/dashboard')
}

export async function deletePost(formData) {
      //check if user is signed in
const user = await getAuthUser();
if(!user) return redirect("/");

// find the post
const postCollection = await getCollection("posts");
const post = await postCollection.findOne({
    _id:ObjectId.createFromHexString(formData.get("postId")),
});

//check the auth user owns the post
if(user.userId !== post.postId) return redirect ('/');

//delete the post
postCollection.findOneAndDelete({_id: post._id });

revalidatePath('/dashboard')
}