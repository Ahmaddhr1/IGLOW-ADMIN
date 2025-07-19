import { Loader2 } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className='flex items-center justify-center w-full max-h-[100vh]'><Loader2 className='w-10 h-10 animate-spin'/></div>
  )
}

export default Loading