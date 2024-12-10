'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormData = z.infer<typeof schema>;

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      }
      setIsLoading(false)
      router.push('/dashboard');
    } catch (error: any) {
      setIsLoading(false)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full">{isLoading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}</Button>
        <p className="text-center">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Button variant="link" type="button" onClick={() => setIsLogin(!isLogin)} disabled={isLoading}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </Button>
        </p>
      </form>
    </div>
  );
}