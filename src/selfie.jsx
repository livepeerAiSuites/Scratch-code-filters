import React from 'react'
import { useEffect ,useRef,useState} from 'react';
import image from "./assets/bg.jpeg";

export default function Selfie() {
    const videoRef = useRef(null);
    const videoEl = document.querySelector('video');
    const bgImage = new Image(480, 270);
    bgImage.src = image;
    console.log(bgImage,"imgae")
const canvas = new OffscreenCanvas(480, 270);
const ctx = canvas.getContext("2d");

async function enableCam(event) {
    // videoElement = videoRef.current;


    navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 270, frameRate: { ideal: 15, max: 30 } },
        audio: false
      })
        .then((stream) => {
          /* use the stream */
          console.log(stream,"streamm")
          background_removal(stream.getVideoTracks()[0]);
        })
        .catch((err) => {
          /* handle the error */
          console.error('An error has ocurred:', err);
        });
}

function background_removal(videoTrack) {
    const selfieSegmentation = new SelfieSegmentation({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
  console.log(selfieSegmentation,"seee")
  selfieSegmentation.setOptions({
    modelSelection: 1,
    selfieMode: true,
  });

  selfieSegmentation.onResults(onResults);


  const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
  const trackGenerator = new MediaStreamTrackGenerator({ kind: 'video' });

  const transformer = new TransformStream({
    async transform(videoFrame, controller) {
      videoFrame.width = videoFrame.displayWidth;
      videoFrame.height = videoFrame.displayHeight;
      await selfieSegmentation.send({ image: videoFrame });

      const timestamp = videoFrame.timestamp;
      const newFrame = new VideoFrame(canvas, {timestamp});

      videoFrame.close();
      controller.enqueue(newFrame);
    }
  });

  trackProcessor.readable.pipeThrough(transformer).pipeTo(trackGenerator.writable)
 console.log("streamm")
  const processedStream = new MediaStream();
  processedStream.addTrack(trackGenerator);
  
}


function onResults(results) {
    ctx.save();
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.drawImage(
      results.segmentationMask,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    ctx.globalCompositeOperation = "source-out";
    const pat = ctx.createPattern(bgImage, "no-repeat");
    ctx.fillStyle = pat;
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    // Only overwrite missing pixels.
    ctx.globalCompositeOperation = "destination-atop";
    ctx.drawImage(
      results.image,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    ctx.restore();
  }
  return (
    <div className='w-full flex flex-col items-center py-6'>
        <button onClick={enableCam}>Start</button>
         <video autoplay className='bg-black h-56 ' ref={videoRef} />
   </div>
  )
}
