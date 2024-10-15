'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

const schema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  chapter: z.string().min(1, { message: 'Current chapter is required' }),
  totalChapters: z.string().min(1, { message: 'Total chapters is required' }),
  url: z.string().url({ message: 'Invalid URL' }),
  isComplete: z.boolean(),
  alternateTitles: z.string(),
});

type FormData = z.infer<typeof schema>;

interface AddMangaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMangaModal({ isOpen, onClose }: AddMangaModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMangaMutation = useMutation(
    async (data: FormData) => {
      const newManga = {
        ...data,
        alternateTitles: data.alternateTitles.split(',').map(t => t.trim()),
        dateCreated: Timestamp.now(),
        dateUpdated: Timestamp.now(),
      };
      await addDoc(collection(db, 'list'), newManga);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mangas']);
        toast({ title: 'Manga added successfully' });
        reset();
        onClose();
      },
      onError: (error: any) => {
        toast({ title: 'Error adding manga', description: error.message, variant: 'destructive' });
      },
    }
  );

  const onSubmit = (data: FormData) => {
    addMangaMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Manga</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="chapter">Current Chapter</Label>
            <Input id="chapter" {...register('chapter')} />
            {errors.chapter && <p className="text-red-500 text-sm">{errors.chapter.message}</p>}
          </div>
          <div>
            <Label htmlFor="totalChapters">Total Chapters</Label>
            <Input id="totalChapters" {...register('totalChapters')} />
            {errors.totalChapters && <p className="text-red-500 text-sm">{errors.totalChapters.message}</p>}
          </div>
          <div>
            <Label htmlFor="url">URL</Label>
            <Input id="url" {...register('url')} />
            {errors.url && <p className="text-red-500 text-sm">{errors.url.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isComplete" {...register('isComplete')} />
            <Label htmlFor="isComplete">Completed</Label>
          </div>
          <div>
            <Label htmlFor="alternateTitles">Alternate Titles (comma-separated)</Label>
            <Input id="alternateTitles" {...register('alternateTitles')} />
          </div>
          <Button type="submit">Add Manga</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}