'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const { data: mangas, isLoading, isError } = useQuery<Manga[]>(['mangas'], async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'list'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manga));
  });

  const updateMangaMutation = useMutation(
    async (manga: Partial<Manga> & { id: string }) => {
      const docRef = doc(db, 'list', manga.id);
      await updateDoc(docRef, { ...manga, dateUpdated: Timestamp.now() });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mangas']);
        toast({ title: 'Manga updated successfully' });
      },
      onError: (error: any) => {
        toast({ title: 'Error updating manga', description: error.message, variant: 'destructive' });
      },
    }
  );

  const deleteMangaMutation = useMutation(
    async (id: string) => {
      const docRef = doc(db, 'list', id);
      await deleteDoc(docRef);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mangas']);
        toast({ title: 'Manga deleted successfully' });
      },
      onError: (error: any) => {
        toast({ title: 'Error deleting manga', description: error.message, variant: 'destructive' });
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching manga list</div>;

  return (
    <div className="space-y-4">
      {mangas?.map((manga) => (
        <div key={manga.id} className="bg-white shadow rounded-lg p-4">
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
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            </form>
          ) : (
            <>
              <h3 className="text-lg font-semibold">{manga.title}</h3>
              <p>Chapter: {manga.chapter} / {manga.totalChapters}</p>
              <p>Status: {manga.isComplete ? 'Completed' : 'Ongoing'}</p>
              <p>Alternate Titles: {manga.alternateTitles.join(', ')}</p>
              <a href={manga.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Read</a>
              <div className="mt-2">
                <Button onClick={() => setEditingId(manga.id)} className="mr-2">Edit</Button>
                <Button onClick={() => deleteMangaMutation.mutate(manga.id)} variant="destructive">Delete</Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}