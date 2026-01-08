"use client"

import React, { FC, useState } from 'react'
import Button from './ui/Button'
import { addFriendValidator } from '@/lib/validations/add-friend'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'




interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton:FC<AddFriendButtonProps> = ({}) => {
    const [showSuccess, setShowSuccess] = useState<boolean>(false)

    const {register, handleSubmit, setError, formState:{errors}} = useForm<FormData>({
        resolver: zodResolver(addFriendValidator)
    })

    const addFriend = async (email: string) => {
        try {

            await axios.post('/api/friend/add', {
                email
            })
            setShowSuccess(true)

        } catch (error) {
            if(error instanceof z.ZodError){
                setError('email', {message: error.message})
                return;
            }

            setError('email', {message: "Something went wrong"})

            
        }
    }

    const onSubmit = (data: FormData) => {
        addFriend(data.email)
    }




  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-md w-full mx-auto'>
        <div className='flex flex-col gap-6'>
          <div>
            <div className='relative group'>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
                </div>
                 <input type="text" 
                {...register("email")}
                placeholder="friend@example.com"
                className='block w-full rounded-full border-0 py-3.5 pl-11 px-4 text-slate-700 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-200 sm:text-sm sm:leading-6 bg-white/50 focus:bg-white shadow-inner transition-all duration-300' />
                 <p className='absolute -bottom-6 left-4 text-sm text-red-400 font-medium'>{errors.email?.message}</p>
                 {showSuccess? (
                <p className='absolute -bottom-6 left-4 text-sm text-green-500 font-medium'>Friend request sent!</p>
            )
            :null}
            </div>
           
           </div>
           <div className="mt-4">
                <Button className="w-full rounded-full h-12 shadow-lg hover:shadow-xl hover:shadow-sky-100 transition-all duration-300">Send Friend Request</Button>
           </div>
            
        </div>
       
    </form>
  )
}

export default AddFriendButton
