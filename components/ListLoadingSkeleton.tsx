'use client'

import React from 'react'
import { Button } from './ui/button'
import { Skeleton } from '@radix-ui/themes'

export default function ListLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill('').map((_, idx) => (
        <Skeleton key={idx}>
          <div className='text-white capitalize'>
            <h3 className="text-lg font-semibold">Manga Title</h3>
            <p>Chapter: 0 / 0</p>
            <p>Status: Ongoing</p>
            <p>Alternate Titles: Title1, Title2</p>
              {/* <a href={manga.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-200 rounded-sm text-slate-900 hover:underline">Read</a> */}
            <div className="mt-4 flex justify-between">
              <div>
                <Button type='button' variant='secondary'>Read</Button>
              </div>

              <div>
                <Button className="mr-2">Edit</Button>
                <Button variant="destructive">Delete</Button>
              </div>
            </div>
          </div>
        </Skeleton>
      ))}
    </div>
  )
}
