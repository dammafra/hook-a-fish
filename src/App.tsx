import { lazy, StrictMode, Suspense } from 'react'
import Experience from './components/Experience'
import ScrollResetter from './components/helpers/ScrollResetter'
import WaitForWarmup from './components/helpers/WaitForWarmup'
import Loader from './components/interface/Loader'
import { isDebug } from './utils/debug'

// Debug only, out of the main bundle
const Leva = lazy(() => import('leva').then(({ Leva }) => ({ default: Leva })))

export default function App() {
  return (
    <>
      {isDebug && (
        <Suspense>
          <Leva collapsed theme={{ sizes: { rootWidth: '350px' } }} />
        </Suspense>
      )}
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
