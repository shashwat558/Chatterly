import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react';
import React, { ButtonHTMLAttributes, FC } from 'react'

const buttonVariants = cva(
    'active:scale-95 inline-flex item-center justify-center rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none',
    {  
       variants:{
        variants: {
            default: "bg-slate-900 text-white hover:bg-slate-800",
            ghost: "bg-transparent hover:text-slate-900 hover:bg-slate-200"
        },
        size:{
            default: "h-10 py-2 px-4",
            sm: 'h-9 px-2',
            lg: 'h-11 px-8',
        }

       },
       defaultVariants: {
        variants: 'default',
        size: "default"
       }
       
        
    },
 
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    
}

const Button: FC<ButtonProps> = ({className, children, variants, isLoading, size, ...props}) => {

  return (
   <button {...props} className={cn(buttonVariants({variants, size, className}))} disabled= {isLoading}>
    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' />: null}
    {children}
   </button>
  )
}

export default Button