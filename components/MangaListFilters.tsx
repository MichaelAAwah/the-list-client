'use client'

import { Button, Card, DropdownMenu } from '@radix-ui/themes'
import React from 'react'

export default function MangaListFilters() {
  return (
    <Card>
      <div className='flex justify-between'>
        <div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                Sort
                <DropdownMenu.TriggerIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.RadioGroup>
                <DropdownMenu.RadioItem value='name'>Name</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value='date_created'>Date Created</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value='date_updated'>Date Updated</DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
              <DropdownMenu.Separator />
              <DropdownMenu.RadioGroup>
                <DropdownMenu.RadioItem value='asc'>Ascending</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value='desc'>Descending</DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

        </div>
      </div>
    </Card>
  )
}
