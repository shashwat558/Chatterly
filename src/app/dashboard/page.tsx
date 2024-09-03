import Button from '@/components/Button'
import React, { FC } from 'react'

interface PageProps {}

const page : FC<PageProps>= () => {
  return (
    <Button isLoading={false}>hELLO</Button>
  )
}

export default page