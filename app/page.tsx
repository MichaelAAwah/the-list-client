import AuthForm from '@/components/AuthForm';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Welcome to The List</h1>
      <AuthForm />
    </div>
  );
}