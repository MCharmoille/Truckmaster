import { APP_NAME } from './appName.js'

export default function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 font-sans text-white">
      <h1 className="text-4xl font-bold">{APP_NAME}</h1>
    </div>
  )
}
