import Bucket from './Bucket'
import Controller from './Controller'
import Countdown from './Countdown'
import Fishes from './Fishes'
import Grass from './Grass'
import Menu from './Menu'
import Water from './Water'

export default function World() {
  return (
    <>
      <Menu />
      <Countdown />

      <Controller />
      <Fishes />
      <Water />
      <Bucket />
      <Grass />
    </>
  )
}
