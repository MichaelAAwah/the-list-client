// app/(wherever)/MangaList.tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, Timestamp, limit, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, where, QueryOrderByConstraint, QueryLimitConstraint, QueryStartAtConstraint } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, Spinner } from '@radix-ui/themes';
import { Pagination, PaginationContent, PaginationNext, PaginationPrevious } from './ui/pagination';

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

const PAGE_SIZE = 25;

export default function MangaList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [pages, setPages] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalMangas, setTotalMangas] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'not_completed'>('all');
  const [sortField, setSortField] = useState<'title' | 'dateCreated' | 'dateUpdated'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchTotalMangas = async () => {
      const snapshot = await getDocs(collection(db, 'list'));
      setTotalMangas(snapshot.size);
    };
    fetchTotalMangas();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageIndex]);

  const { data: mangas, isLoading, isError, isFetching } = useQuery<Manga[]>({
    queryKey: ['mangas', pageIndex, searchTerm, filterCompleted, sortField, sortOrder],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      if (searchTerm) {
        const snapshot = await getDocs(collection(db, 'list'));
        let allMangas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manga));

        if (filterCompleted !== 'all') {
          allMangas = allMangas.filter(manga => filterCompleted === 'completed' ? manga.isComplete : !manga.isComplete);
        }

        return allMangas.filter(manga =>
          manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manga.alternateTitles.some(title => title.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Normal paginated query
      let constraints: (QueryOrderByConstraint | QueryStartAtConstraint | QueryLimitConstraint)[] = [orderBy(sortField, sortOrder), limit(PAGE_SIZE)];
      if (pageIndex !== 0 && pages[pageIndex - 1]) {
        constraints = [orderBy(sortField, sortOrder), startAfter(pages[pageIndex - 1]), limit(PAGE_SIZE)];
      }

      let q = query(collection(db, 'list'), ...constraints);
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docs = snapshot.docs;
        const lastVisible = docs[docs.length - 1];
        setPages(prev => {
          const newPages = [...prev];
          newPages[pageIndex] = lastVisible;
          return newPages;
        });
      }

      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manga));

      if (filterCompleted !== 'all') {
        data = data.filter(manga => filterCompleted === 'completed' ? manga.isComplete : !manga.isComplete);
      }

      return data;
    },

    // queryFn: async () => {
    //   const user = auth.currentUser;
    //   if (!user) throw new Error('User not authenticated');

    //   let constraints: (QueryOrderByConstraint | QueryStartAtConstraint | QueryLimitConstraint)[] = [orderBy(sortField, sortOrder), limit(PAGE_SIZE)];

    //   if (pageIndex !== 0 && pages[pageIndex - 1]) {
    //     constraints = [orderBy(sortField, sortOrder), startAfter(pages[pageIndex - 1]), limit(PAGE_SIZE)];
    //   }

    //   let q = query(collection(db, 'list'), ...constraints);
    //   const snapshot = await getDocs(q);

    //   if (!snapshot.empty) {
    //     const docs = snapshot.docs;
    //     const lastVisible = docs[docs.length - 1];
    //     setPages(prev => {
    //       const newPages = [...prev];
    //       newPages[pageIndex] = lastVisible;
    //       return newPages;
    //     });
    //   }

    //   let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manga));

    //   if (filterCompleted !== 'all') {
    //     data = data.filter(manga => filterCompleted === 'completed' ? manga.isComplete : !manga.isComplete);
    //   }

    //   if (searchTerm) {
    //     data = data.filter(manga =>
    //       manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //       manga.alternateTitles.some(title => title.toLowerCase().includes(searchTerm.toLowerCase()))
    //     );
    //   }

    //   return data;
    // },
    keepPreviousData: true,
  });

  // const updateMangaMutation = useMutation({
  //   mutationFn: async (manga: Partial<Manga> & { id: string }) => {
  //     const docRef = doc(db, 'list', manga.id);
  //     await updateDoc(docRef, { ...manga, dateUpdated: Timestamp.now() });
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(['mangas']);
  //     toast({ title: 'Manga updated successfully' });
  //   },
  //   onError: (error: any) => {
  //     toast({ title: 'Error updating manga', description: error.message, variant: 'destructive' });
  //   },
  // });

  // const deleteMangaMutation = useMutation({
  //   mutationFn: async (id: string) => {
  //     const docRef = doc(db, 'list', id);
  //     await deleteDoc(docRef);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(['mangas']);
  //     toast({ title: 'Manga deleted successfully' });
  //   },
  //   onError: (error: any) => {
  //     toast({ title: 'Error deleting manga', description: error.message, variant: 'destructive' });
  //   },
  // });

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

  const totalPages = Math.ceil(totalMangas / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className='mb-4'>
        <MangaListFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCompleted={filterCompleted}
          setFilterCompleted={setFilterCompleted}
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>

      {/* {mangas?.map((manga) => (
        <Card key={manga.id}>
          <div className='capitalize'>
            <h3 className="text-lg font-semibold">{manga.title}</h3>
            <p>Chapter: {manga.chapter} / {manga.totalChapters}</p>
            <p>Status: {manga.isComplete ? 'Completed' : 'Ongoing'}</p>
            <p>Alternate Titles: {manga.alternateTitles.join(', ')}</p>
            <div className="mt-4 flex justify-between">
              <Button type='button' variant='secondary' onClick={() => window.open(manga.url, '_blank', 'noopener,noreferrer')}>Read</Button>
              <div>
                <Button onClick={() => updateMangaMutation.mutate(manga)} variant="default" className="mr-2">Edit</Button>
                <Button onClick={() => deleteMangaMutation.mutate(manga.id)} variant="destructive">Delete</Button>
              </div>
            </div>
          </div>
        </Card>
      ))} */}
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
            <Button variant="outline" onClick={() => setPageIndex(0)} disabled={pageIndex === 0 || isFetching}>
              First
            </Button>
            <PaginationPrevious
              className='cursor-pointer'
              onClick={() => setPageIndex(prev => Math.max(prev - 1, 0))}
              aria-disabled={pageIndex === 0 || isFetching}
            />
            <div className="px-4 py-2 text-sm text-muted-foreground">Page {pageIndex + 1} of {totalPages}</div>
            <PaginationNext
              className='cursor-pointer'
              onClick={() => setPageIndex(prev => prev + 1)}
              aria-disabled={mangas && mangas.length < PAGE_SIZE}
            />
            <Button variant="outline" onClick={() => setPageIndex(totalPages - 1)} disabled={pageIndex === totalPages - 1 || isFetching}>
              Last
            </Button>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
