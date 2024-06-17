import React from 'react'
import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision"
import { useEffect ,useRef,useState} from 'react';
import image from "./assets/bg.jpeg";





export default function Mediapipe() {
  // let imageSegmenter;
   const [webcamRunning,setIsCam]=useState(true)
   const [imageSegmenter,setSegmenter]=useState()

    const videoRef = useRef(null);
    var videoElement;
    const canvasRef = useRef(null);
    const canvasElement = canvasRef.current; 
    const canvasCtx = canvasElement?.getContext("2d")
    const backgroundImage = new Image(480, 270);
    backgroundImage.src = image;

          let lastWebcamTime = -1;
          async function predictWebcam() {
                videoElement = videoRef.current;
                if (videoElement.currentTime === lastWebcamTime) {
                  if (webcamRunning === true) {
                    window.requestAnimationFrame(predictWebcam);
                  }
                  return;
                }
                lastWebcamTime = videoElement.currentTime;
                canvasCtx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
           
                // Do not segmented if imageSegmenter hasn't loaded
                if (imageSegmenter === undefined) {
                  return;
                }
                // if image mode is initialized, create a new segmented with video runningMode
                // if (runningMode === "IMAGE") {
                //   runningMode = "VIDEO";
                //   await imageSegmenter.setOptions({
                //     runningMode: runningMode
                //   });
                // }
                let startTimeMs = performance.now();

                // Start segmenting the stream.
                imageSegmenter.segmentForVideo(videoElement, startTimeMs, callbackForVideo);
          }

  
 
     console.log(FilesetResolver,"resolver")
     async function createImageSegmenter() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      console.log(vision,"visss")

   const imageSegment = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite",
    
        },
        outputCategoryMask: true,
        outputConfidenceMasks: false,
        runningMode: "VIDEO"
      });
      setSegmenter(imageSegment)
     console.log(imageSegment,"image segment in useEffect")
      const labels = imageSegment.getLabels();
      console.log(labels,"llllabel")
   
     }
    
     useEffect(()=>{
          createImageSegmenter()
     },[])
     function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }


    async function enableCam(event) {
      videoElement = videoRef.current;
      // if (imageSegmenter === undefined) {
      //   return;
      // }
    
      // if (webcamRunning === true) {
      //   webcamRunning = false;
      //   enableWebcamButton.innerText = "ENABLE SEGMENTATION";
      // } else {
      //   webcamRunning = true;
      //   enableWebcamButton.innerText = "DISABLE SEGMENTATION";
      //}
    
      // getUsermedia parameters.
      const constraints = {
        video: true
      };
    
      // Activate the webcam stream.
      videoElement.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.play();

      videoElement.addEventListener("loadeddata",predictWebcam);
    }


    function callbackForVideo(result) {
        console.log(result,"callback")

        let imageData = canvasCtx.getImageData(
          0,
          0,
          videoElement.videoWidth,
          videoElement.videoHeight
        ).data;


        const mask = result.categoryMask.getAsFloat32Array();
        console.log(mask,result.categoryMask,"maskk")
        let j = 0;
        for (let i = 0; i < mask.length; ++i) {
          const maskVal = Math.round(mask[i] * 255.0);
          const legendColor = legendColors[maskVal % legendColors.length];
          imageData[j] = (legendColor[0] + imageData[j]) / 2;
          imageData[j + 1] = (legendColor[1] + imageData[j + 1]) / 2;
          imageData[j + 2] = (legendColor[2] + imageData[j + 2]) / 2;
          imageData[j + 3] = (legendColor[3] + imageData[j + 3]) / 2;
          j += 4;
        }

        const uint8Array = new Uint8ClampedArray(imageData.buffer);
        const dataNew = new ImageData(
          uint8Array,
          videoElement.videoWidth,
          videoElement.videoHeight
        );
        canvasCtx.putImageData(dataNew, 0, 0);
        if (webcamRunning === true) {
          window.requestAnimationFrame(predictWebcam);
        }
      
      
    }


    // js/main.js

//     function callbackForVideo(result) {
//       canvasCtx.save();
//       canvasCtx.clearRect(
//     0,
//     0,
//     canvasElement.width,
//     canvasElement.height
//   );
//   canvasCtx.drawImage(
//     result.categoryMask,
//     0,
//     0,
//     canvasElement.width,
//     canvasElement.height
//   );

//   canvasCtx.globalCompositeOperation = "source-out";
//   const pat = ctx.createPattern( backgroundImage, "no-repeat");
//   canvasCtx.fillStyle = pat;
//   canvasCtx.fillRect(
//     0,
//     0,
//     canvasElement.width,
//     canvasElement.height
//   );

//   // Only overwrite missing pixels.
//   canvasCtx.globalCompositeOperation = "destination-atop";
//   canvasCtx.drawImage(videoElement, 0, 0, 1000, 1000);
//   // ctx.drawImage(
//   //   result.image,
//   //   0,
//   //   0,
//   //   canvas.width,
//   //   canvas.height
//   // );

//   canvasCtx.restore();
// }
  
  return (
    <div className='w-full flex flex-col items-center py-6'>
            <button onClick={enableCam}>Start</button>
         <video autoplay className='bg-black h-56 ' width="1280px" height="720px"  ref={videoRef} />
         <canvas id="canvas" width="1280px" height="720px" ref={canvasRef} ></canvas>


      
    </div>
  )
}



const legendColors = [
  [255, 197, 0, 255], // Vivid Yellow
  [128, 62, 117, 255], // Strong Purple
  [255, 104, 0, 255], // Vivid Orange
  [166, 189, 215, 255], // Very Light Blue
  [193, 0, 32, 255], // Vivid Red
  [206, 162, 98, 255], // Grayish Yellow
  [129, 112, 102, 255], // Medium Gray
  [0, 125, 52, 255], // Vivid Green
  [246, 118, 142, 255], // Strong Purplish Pink
  [0, 83, 138, 255], // Strong Blue
  [255, 112, 92, 255], // Strong Yellowish Pink
  [83, 55, 112, 255], // Strong Violet
  [255, 142, 0, 255], // Vivid Orange Yellow
  [179, 40, 81, 255], // Strong Purplish Red
  [244, 200, 0, 255], // Vivid Greenish Yellow
  [127, 24, 13, 255], // Strong Reddish Brown
  [147, 170, 0, 255], // Vivid Yellowish Green
  [89, 51, 21, 255], // Deep Yellowish Brown
  [241, 58, 19, 255], // Vivid Reddish Orange
  [35, 44, 22, 255], // Dark Olive Green
  [0, 161, 194, 255] // Vivid Blue
];
