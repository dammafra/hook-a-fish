import { Leva } from 'leva'
import { StrictMode } from 'react'
import Experience from './components/Experience'
import { useDebug } from './hooks/use-debug'

export default function App() {
  const debug = useDebug()

  return (
    <>
      <Leva hidden={!debug} collapsed theme={{ sizes: { rootWidth: '350px' } }} />

      {/* See https://github.com/pmndrs/leva/issues/552 */}
      <StrictMode>
        <Experience />
      </StrictMode>
    </>
  )
}
