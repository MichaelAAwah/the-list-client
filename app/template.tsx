export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 to-sky-900">
      {children}
    </div>
  )
}