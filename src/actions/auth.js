"use server"
import bcrypt from 'bcrypt';
import { getCollection } from "@/lib/db";
import { LoginFormSchema, RegisterFormSchema } from "@/lib/rules";
import { redirect } from 'next/navigation';
import { createSession } from '@/lib/sessions';
import { cookies } from 'next/headers';


export async function register(state,formData){
// await new Promise((resolve)=>setTimeout(resolve,3000));

//validate form fields
const validatedFields=RegisterFormSchema.safeParse({
    email:formData.get('email'),
    password:formData.get('password'),
    confirmPassword:formData.get('confirmPassword')
});

//if any forms are invalid
if(!validatedFields.success){
    return {
        errors:validatedFields.error.flatten().fieldErrors,
        email:formData.get('email'),
    };
}

//extract the form fields
const {email,password} =validatedFields.data;

//check if email is already registered
const userCollection= await getCollection('users');
if(!userCollection){
    return {errors: {email: "Server Error!"}}
}
const existingUser= await userCollection.findOne({email});
if(existingUser){
    return {errors: {email: "Email already existing in our database!"} }
}
//hash the password
const hashedPassword= await bcrypt.hash(password,10);

//save in db
const results = await userCollection.insertOne({email, password: hashedPassword, });

//create session
await createSession(results.insertedId.toString());

//redirect
redirect("/dashboard");
}

export async function login(state,formData) {
   //validate form fields
const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
})

   //if any form fields are invalid
if(!validatedFields.success){
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        email: formData.get("email")
    }
}

   //extract form fields
const {email,password} = validatedFields.data;

   //check if email exist in our db
const userCollection = await getCollection('users');
if(!userCollection) return {
    errors: {email:"Server error!"}
};

const existingUser = await userCollection.findOne({email})
if(!existingUser) return {
    errors: {email:"Invalid credentials!"}
};

   //check password
const matchedPassword = await bcrypt.compare(password,existingUser.password)
if(!matchedPassword) return {
    errors: {email:"Invalid credentials!"}
};
   
   //create a session
await createSession(existingUser._id.toString())
 console.log(existingUser);
   //redirect
   redirect('/dashboard')
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect('/');
    
}