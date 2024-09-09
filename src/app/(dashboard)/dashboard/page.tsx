import Button from '@/components/ui/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'




const page = async({}) =>  {
  

  const session = await getServerSession(authOptions)
  if(!session){
    return redirect('/')
  }
  



  return (
    <div className='font-semibold text-4xl'>Add a friend</div>
  )
}

export default page