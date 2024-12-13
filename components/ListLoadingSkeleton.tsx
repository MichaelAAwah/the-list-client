'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, Skeleton } from '@radix-ui/themes'

export default function ListLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill('').map((_, idx) => (
        <Card key={idx}>
          <div className='text-white capitalize'>
            <h3 className="text-lg font-semibold"><Skeleton>Manga Title</Skeleton></h3>
            <p><Skeleton>Chapter: 0 / 0</Skeleton></p>
            <p><Skeleton>Status: Ongoing</Skeleton></p>
            <p><Skeleton>Alternate Titles: Title1, Title2</Skeleton></p>
              {/* <a href={manga.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-200 rounded-sm text-slate-900 hover:underline">Read</a> */}
            <div className="mt-4 flex justify-between">
              <div>
                <Skeleton>
                  <Button type='button' variant='secondary'>Read</Button>
                </Skeleton>
              </div>

              <div>
                <Skeleton>
                  <Button className="mr-2">Edit</Button>
                </Skeleton>
                <Skeleton>
                  <Button variant="destructive">Delete</Button>
                </Skeleton>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
