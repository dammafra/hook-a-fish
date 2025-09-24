import Controller from './Controller'
import Fishes from './Fishes'
import Grass from './Grass'
import Countdown from './interface/Countdown'
import Menu from './interface/Menu'
import Water from './Water'

export default function World() {
  return (
    <>
      <Menu />
      <Countdown seconds={60} />

      <Controller />
      <Fishes />
      <Water />
      <Grass />
    </>
  )
}
