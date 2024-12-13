'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, Timestamp, limit, startAfter, QueryDocumentSnapshot, DocumentData, endBefore, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

import { Card, Spinner } from '@radix-ui/themes';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from './ui/pagination';

import ListLoadingSkeleton from './ListLoadingSkeleton';
import MangaListFilters from './MangaListFilters';

interface Manga {
  id: string;
  title: string;
  chapter: string;
  totalChapters: string;
  url: string;
  isComplete: boolean;
  alternateTitles: string[];
  dateCreated: Timestamp;
  dateUpdated: Timestamp;
}

export default function MangaList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState<'next' | 'prev'>('next'); // Number of items per page
  const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null); // Track the first document
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null); // Track the last document
  // check loading states for page changes

  const { data: mangas, isLoading, isError } = useQuery<Manga[]>({
    queryKey: ['mangas', page], 
    queryFn: async ({ queryKey }) => {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const [_key, page] = queryKey

      const q = query(collection(db, 'list'), orderBy('title'), page === 'next' ? startAfter(lastDoc) : endBefore(firstDoc), limit(25));
      const querySnapshot = await getDocs(q);

      const firstVisible = querySnapshot.docs[0];
      setFirstDoc(firstVisible)

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastDoc(lastVisible)

      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manga));
    },
    keepPreviousData: true
  });

  const updateMangaMutation = useMutation(
    async (manga: Partial<Manga> & { id: string }) => {
      setIsEditing(true)
      const docRef = doc(db, 'list', manga.id);
      await updateDoc(docRef, { ...manga, dateUpdated: Timestamp.now() });
    },
    {
      onSuccess: () => {
        setIsEditing(false)
        queryClient.invalidateQueries(['mangas']);
        toast({ title: 'Manga updated successfully' });
      },
      onError: (error: any) => {
        setIsEditing(false)
        toast({ title: 'Error updating manga', description: error.message, variant: 'destructive' });
      },
    }
  );

  const deleteMangaMutation = useMutation(
    async (id: string) => {
      setIsDeleting(true)
      const docRef = doc(db, 'list', id);
      await deleteDoc(docRef);
    },
    {
      onSuccess: () => {
        setIsDeleting(false)
        queryClient.invalidateQueries(['mangas']);
        toast({ title: 'Manga deleted successfully' });
      },
      onError: (error: any) => {
        setIsDeleting(false)
        toast({ title: 'Error deleting manga', description: error.message, variant: 'destructive' });
      },
    }
  );

  if (isLoading) return <ListLoadingSkeleton />;
  if (isError) return <div>Error fetching manga list</div>;

  return (
    <div className="space-y-4">
      <div className='mb-4'>
        <MangaListFilters />
      </div>
      {mangas?.map((manga) => (
        <Card key={manga.id}>
          {editingId === manga.id ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedManga = {
                id: manga.id,
                title: formData.get('title') as string,
                chapter: formData.get('chapter') as string,
                totalChapters: formData.get('totalChapters') as string,
                url: formData.get('url') as string,
                isComplete: formData.get('isComplete') === 'on',
                alternateTitles: (formData.get('alternateTitles') as string).split(',').map(t => t.trim()),
              };
              updateMangaMutation.mutate(updatedManga);
              setEditingId(null);
            }} className="space-y-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={manga.title} required />
              </div>
              <div>
                <Label htmlFor="chapter">Current Chapter</Label>
                <Input id="chapter" name="chapter" defaultValue={manga.chapter} required />
              </div>
              <div>
                <Label htmlFor="totalChapters">Total Chapters</Label>
                <Input id="totalChapters" name="totalChapters" defaultValue={manga.totalChapters} required />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" defaultValue={manga.url} required />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isComplete" name="isComplete" defaultChecked={manga.isComplete} />
                <Label htmlFor="isComplete">Completed</Label>
              </div>
              <div>
                <Label htmlFor="alternateTitles">Alternate Titles (comma-separated)</Label>
                <Input id="alternateTitles" name="alternateTitles" defaultValue={manga.alternateTitles.join(', ')} />
              </div>
              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={isEditing}><Spinner loading={isEditing} /> {isEditing ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline" className='ms-2' onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className='capitalize'>
              <h3 className="text-lg font-semibold">{manga.title}</h3>
              <p>Chapter: {manga.chapter} / {manga.totalChapters}</p>
              <p>Status: {manga.isComplete ? 'Completed' : 'Ongoing'}</p>
              <p>Alternate Titles: {manga.alternateTitles.join(', ')}</p>
                {/* <a href={manga.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-200 rounded-sm text-slate-900 hover:underline">Read</a> */}
              <div className="mt-4 flex justify-between">
                <div>
                  <Button type='button' variant='secondary' onClick={() => window.open(manga.url, '_blank', 'noopener,noreferrer')}>Read</Button>
                </div>

                <div>
                  <Button onClick={() => setEditingId(manga.id)} className="mr-2" variant="default">Edit</Button>
                  <Button onClick={() => deleteMangaMutation.mutate(manga.id)} variant="destructive" disabled={isDeleting}>
                    <Spinner loading={isDeleting}>
                    </Spinner>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}
      <div className='mt-4'>
        <Pagination>
          <PaginationContent>
            <PaginationPrevious className='cursor-pointer' onClick={() => setPage('prev')} aria-disabled={!firstDoc || isLoading} />
            <PaginationNext className='cursor-pointer' onClick={() => setPage('next')} aria-disabled={!lastDoc || isLoading} />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}