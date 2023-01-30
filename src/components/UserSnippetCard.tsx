import React from 'react'
import { IUserSnippet } from '../types'

const UserSnippetCard = ({ userSnippet } : {userSnippet : IUserSnippet}) => {
  return (
    <div className="flex items-center">
      <img className="w-10 h-10 rounded-full mr-4" src="/img/jonathan.jpg" alt="Avatar of Jonathan Reinink"/>
      <div className="text-sm">
        <p className="text-gray-900 leading-none">{userSnippet.name}</p>
        <p className="text-gray-600">{userSnippet.username}</p>
      </div>
    </div>
  )
}

export default UserSnippetCard