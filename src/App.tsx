import { Leva } from 'leva'
import { StrictMode } from 'react'
import Experience from './components/Experience'
import useDebug from './stores/use-debug'

export default function App() {
  const debug = useDebug(state => state.debug)

  return (
    <>
      <Leva hidden={!debug} theme={{ sizes: { rootWidth: '350px' } }} />

      {/* See https://github.com/pmndrs/leva/issues/552 */}
      <StrictMode>
        <Experience />
      </StrictMode>
    </>
  )
}
