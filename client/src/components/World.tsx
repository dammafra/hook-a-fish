import Bucket from './Bucket'
import Controller from './Controller'
import Fishes from './Fishes'
import Grass from './Grass'
import Menu from './Menu'
import Timer from './Timer'
import Water from './Water'

export default function World() {
  return (
    <>
      <Menu />
      <Timer />

      <Controller />
      <Fishes />
      <Water />
      <Bucket />
      <Grass />
    </>
  )
}
