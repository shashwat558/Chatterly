"use client"

import React, { FC, useState } from 'react'
import Button from './ui/Button'
import { addFriendValidator } from '@/lib/validations/add-friend'
import { z } from 'zod'
import axios from 'axios'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'




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
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
        <label htmlFor="email" className='block text-sm font-medium leading-6 text-gray-900'>
            Add Friend by E-Mail
        </label>
        <div className='mt-2 flex gap-4'>
            <input type="text" 
            {...register("email")}
            placeholder="your@email.com"
            className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6' />
            <Button>Add</Button>
        </div>
        <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
        {showSuccess? (
            <p className='mt-1 text-sm text-green-600'>Friend requiest sent</p>
        )
        :null}
    </form>
  )
}

export default AddFriendButton