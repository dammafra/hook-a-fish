import { Leva } from 'leva'
import { StrictMode, Suspense } from 'react'
import Experience from './components/Experience'
import ScrollResetter from './components/helpers/ScrollResetter'
import WaitForWarmup from './components/helpers/WaitForWarmup'
import Loader from './components/interface/Loader'
import { useDebug } from './hooks/use-debug'

export default function App() {
  const debug = useDebug()

  return (
    <>
      <Leva hidden={!debug} collapsed theme={{ sizes: { rootWidth: '350px' } }} />
      <ScrollResetter />

      {/* See https://github.com/pmndrs/leva/issues/552 */}
      <StrictMode>
        {/* Outside the loader boundary: the Canvas must mount for models to load and shaders to warm up */}
        <Suspense>
          <Experience />
        </Suspense>

        <Suspense fallback={<Loader />}>
          <WaitForWarmup />
        </Suspense>
      </StrictMode>
    </>
  )
}
