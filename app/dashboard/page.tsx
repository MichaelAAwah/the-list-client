'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import MangaList from '@/components/MangaList';
import AddMangaModal from '@/components/AddMangaModal';
import { Button } from '@/components/ui/button';
import { Skeleton, Spinner } from '@radix-ui/themes';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log({user})
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await auth.signOut();
      setSigningOut(false)
      router.push('/');
    } catch (error) {
      setSigningOut(false)
      console.error('Error signing out:', error);
    }
  };

  // if (!user) {
  //   return <div>Loading...</div>;
  // }

  return (
    <Skeleton loading={!user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Manga List</h1>
          <div>
            <Button onClick={() => setIsAddModalOpen(true)} className="mr-4">Add Manga</Button>
            <Button onClick={handleSignOut} variant="outline" disabled={signingOut}><Spinner loading={signingOut} />{signingOut ? 'Signing Out...' : 'Sign Out'}</Button>
          </div>
        </div>
        <MangaList />
        <AddMangaModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </div>
    </Skeleton>
  );
}