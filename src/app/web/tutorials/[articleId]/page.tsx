import React from 'react'

export default function Article({ articleId } : { articleId: string }) {
  return (
    <div>Article {articleId}</div>
  )
}