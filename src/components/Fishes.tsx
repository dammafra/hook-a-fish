import { useState } from 'react'
import Fish from './Fish'

export default function Fishes() {
  const [fishes, setFishes] = useState(Array.from({ length: 20 }, (_, i) => i))
  const onRemove = (id: number) => setFishes(fishes => fishes.filter(fid => fid !== id))

  return fishes.map(id => <Fish key={`fish-${id}`} id={id} onRemove={onRemove} />)
}
