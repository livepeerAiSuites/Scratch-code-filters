import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Mediapipe from './mediapipe'
import Insertable from './insertable'
import Selfie from './selfie'
import Bodypix from './bodypix'
import Face from './face'
import Filters from './filters'
import Mask from './mask'
import AvaterFilter from './avater'
import MindThree from './mindThree'
import Mindaframe from './mindaframe'


function App() {
  const [count, setCount] = useState(0)

  return (
       <>
         {/* <Mediapipe /> */}
         {/* <Insertable /> */}
         {/* <Selfie /> */}
         {/* <Bodypix /> */}
         {/* <Face /> */}
         {/* <Filters /> */}
         {/* <Mask /> */}
         {/* <AvaterFilter /> */}
     
         <MindThree/>
       </>
  )
}

export default App
