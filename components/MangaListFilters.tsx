'use client'

import { Card, TextField, Button, Select } from '@radix-ui/themes'
import { Dispatch, SetStateAction } from 'react'

interface MangaListFiltersProps {
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  filterCompleted: 'all' | 'completed' | 'not_completed'
  setFilterCompleted: Dispatch<SetStateAction<'all' | 'completed' | 'not_completed'>>
  sortField: 'title' | 'dateCreated' | 'dateUpdated'
  setSortField: Dispatch<SetStateAction<'title' | 'dateCreated' | 'dateUpdated'>>
  sortOrder: 'asc' | 'desc'
  setSortOrder: Dispatch<SetStateAction<'asc' | 'desc'>>
}

export default function MangaListFilters({
  searchTerm,
  setSearchTerm,
  filterCompleted,
  setFilterCompleted,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder
}: MangaListFiltersProps) {
  return (
    <Card className="space-y-4 p-4">
      <TextField.Root
        placeholder="Search title or alternate titles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex flex-wrap gap-4">
        <Select.Root
          value={filterCompleted}
          onValueChange={(value) => setFilterCompleted(value as 'all' | 'completed' | 'not_completed')}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="all">All</Select.Item>
            <Select.Item value="completed">Completed</Select.Item>
            <Select.Item value="not_completed">Not Completed</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={sortField}
          onValueChange={(value) => setSortField(value as 'title' | 'dateCreated' | 'dateUpdated')}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="title">Title</Select.Item>
            <Select.Item value="dateCreated">Date Created</Select.Item>
            <Select.Item value="dateUpdated">Date Updated</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="asc">Ascending</Select.Item>
            <Select.Item value="desc">Descending</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </Card>
  )
}
