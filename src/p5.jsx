import React from 'react'
import * as deepar from 'deepar';
import { useEffect,useRef } from 'react';
let deepAR ;
export default function P5() {
  const canvasRef = useRef(null);
   
    //  useEffect(()=>{
    //   const run=async()=>{
    //       //    deepAR = deepar.initialize({
    //       //     licenseKey: 'f87b53cd1948b8f5419fe69b5c2993d78f5858d64c681f0996c39147602ab204cbd19f596313244b', 
    //       //     previewElement:canvasRef.current,
    //       //     effect: 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators' 
    //       //   });
    //       //   // console.log(deepAR,"depp")
    //       // }
    //       // run()
     
    //  },[deepar])
 
     const start=async()=>{
        deepAR = await deepar.initialize({
        licenseKey: 'f87b53cd1948b8f5419fe69b5c2993d78f5858d64c681f0996c39147602ab204cbd19f596313244b', 
        canvas:canvasRef.current,
        effect: 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators' 
        });
      // await deepAR.switchEffect('path/to/effect/alien');\
      console.log(deepAR)
     }

     const render=async()=>{
             await deepAR.switchEffect('https://cdn.jsdelivr.net/npm/deepar/effects/flowers');
     }
  return (
    <div id="#deepar-div">
             <button onClick={render}>render</button>
          <button onClick={start}>start</button>
            <canvas id="canvas" width="1280px" height="720px" ref={canvasRef} ></canvas>
    </div>
  
  )
}
