import { Center } from '@react-three/drei'
import { random, randomColor } from '../utils/random'
import Fish from './models/Fish'
import { FishTank } from './models/FIshTank'

export default function Acquarium() {
  return (
    <>
      <Center scale={1}>
        <FishTank />
      </Center>
      {Array.from({ length: 20 }, (_, i) => (
        <Center
          key={i}
          scale={random(0.5, 1)}
          position={[random(-0.4, 0.4), random(-0.4, 0.4), random(-1, 1)]}
          rotation={[random(0, Math.PI * 2), random(0, Math.PI * 2), random(0, Math.PI * 2)]}
        >
          <Fish colorA={randomColor()} colorB={randomColor()} colorC={randomColor()} />
        </Center>
      ))}
    </>
  )
}
