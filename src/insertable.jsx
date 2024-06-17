import React from 'react'
import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision"
import { useEffect ,useRef,useState} from 'react';
import bgImage from "./assets/bg.jpeg";

export default function Insertable() {
  // let imageSegmenter;
  const [webcamRunning,setIsCam]=useState(true)
  const [imageSegmenter,setSegmenter]=useState()

  const videoRef = useRef(null);
  const outputRef = useRef(null);
  var outputVideo ;
  var videoElement;
  // const canvas = new OffscreenCanvas(480, 270);
  // const canvasCtx = canvas?.getContext("2d")

  // const canvasRef = useRef(null);
  // const canvasElement = canvasRef.current; 
  // const canvasCtx = canvasElement?.getContext("2d")

  
  async function createImageSegmenter() {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

 

                const imageSegment = await ImageSegmenter.createFromOptions(vision, {
                        baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite",
                    
                        },
                        outputCategoryMask: true,
                        outputConfidenceMasks: false,
                        runningMode: "IMAGE"
                    });
                    setSegmenter(imageSegment)
                    console.log(imageSegment,"image segment in useEffect")
                    const labels = imageSegment.getLabels();
                    console.log(labels,"llllabel")
                
                    }
                    
                    useEffect(()=>{
                        createImageSegmenter()
                     },[])


       async function setupCamera() {
               videoElement = videoRef.current;

                const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                });
                videoElement.srcObject = stream;
                await new Promise((resolve) => {
                  videoElement.onloadedmetadata = () => {
                    resolve(videoElement);
                  };
                });
                return stream;
              }
                    

    async function removeBg(stream) {
            // videoElement = videoRef.current;
            // outputVideo = outputRef.current;
        
            // const constraints = {
            //     video: true
            // };
            
            // // Activate the webcam stream.
            // const stream = await navigator.mediaDevices.getUserMedia(constraints);
            // videoElement.srcObject= stream;
            // videoElement.play();

            const videoTrack = stream.getVideoTracks()[0];

            const processor = new MediaStreamTrackProcessor({ track: videoTrack });
            const generator = new MediaStreamTrackGenerator({ kind: 'video' });

            const reader = processor.readable
            const writer = generator.writable

            console.log(reader,"reader")
            console.log(writer,"writer")


            const transformer = new TransformStream({
                async transform(videoFrame, controller) {
              
                console.log(videoFrame,"frame video")
                const bitmap = await createImageBitmap(videoFrame);
                console.log(bitmap,"map")
               

                const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bitmap, 0, 0);
                console.log("Done 1")

          
        

                const segmentationResult = await imageSegmenter.segment(canvas);

                const mask =  segmentationResult.categoryMask.getAsFloat32Array();

                  const maskData = new Uint8ClampedArray(segmentationResult.categoryMask.width * segmentationResult.categoryMask.height * 4);
                  for (let i = 0; i < mask.length; i++) {
                    const value = mask[i] > 0.5 ? 255 : 0;  // Threshold at 0.5
                    maskData[i * 4] = value;
                    maskData[i * 4 + 1] = value;
                    maskData[i * 4 + 2] = value;
                    maskData[i * 4 + 3] = 255;
                  }

                const maskImageData = new ImageData(maskData, segmentationResult.categoryMask.width, segmentationResult.categoryMask.height);
                 console.log(maskImageData,"mask")
                 ctx.putImageData(maskImageData, 0, 0);

                 ctx.globalCompositeOperation = 'destination-in';
                 ctx.drawImage(bitmap, 0, 0);
                 ctx.globalCompositeOperation = 'destination-over';
                 ctx.fillStyle = 'white';  // Background color
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
           
                 const processedFrame = new VideoFrame(canvas, { timestamp: videoFrame.timestamp });
                 console.log(processedFrame,"freammmes")
                 videoFrame.close();
                 controller.enqueue(processedFrame);
               
                //  processedFrame.close();
           

               
                



                // videoFrame.width = videoFrame.displayWidth;
                // videoFrame.height = videoFrame.displayHeight;
                // const imageBitmap = await createImageBitmap(videoFrame);
                // console.log(imageBitmap,"image bitmap")

                // const segmentationResult = await imageSegmenter.segmentForVideo(imageBitmap, performance.now());
                
                // console.log(segmentationResult,"segmenetat")
                // const timestamp = videoFrame.timestamp;
                // const newFrame = new VideoFrame(canvas, {timestamp});
                // console.log(newFrame,"frame new ")

                // we close the current videoFrame and queue the new one
                
                // videoFrame.close();
                // controller.enqueue(newFrame);

          
                },
                
              });
             
    
              reader
              .pipeThrough(transformer)
              .pipeTo(writer);
              console.log("out here")
           
              // processedStream.addTrack(generator);
              const updatedStream = new MediaStream([generator]);

              videoElement.srcObject =  updatedStream;
              }



     const start=async()=>{
            setupCamera().then((stream) => {
              videoElement.play();
              const processedStream = removeBg(stream);
              // outputVideo.srcObject = processedStream;
              // outputVideo.play();
              console.log(processedStream,"processs stream")
            });
      
     }
  
  return (
    <div className='w-full flex flex-col items-center py-6'>
            <button onClick={start}>Start</button>
         <video autoplay className='bg-black h-56 ' ref={videoRef} />
         {/* <canvas id="canvas" width="1280px" height="720px" ref={canvasRef} ></canvas> */}
         <br></br>
{/* 
         <video autoplay className='bg-black h-56 ' id="outputVideo" ref={outputRef} /> */}
      
    </div>
  )
}



const legendColors = [
  [255, 197, 0, 255], // Vivid Yellow
  // [128, 62, 117, 255], // Strong Purple
  // [255, 104, 0, 255], // Vivid Orange
  // [166, 189, 215, 255], // Very Light Blue
  // [193, 0, 32, 255], // Vivid Red
  // [206, 162, 98, 255], // Grayish Yellow
  // [129, 112, 102, 255], // Medium Gray
  // [0, 125, 52, 255], // Vivid Green
  // [246, 118, 142, 255], // Strong Purplish Pink
  // [0, 83, 138, 255], // Strong Blue
  // [255, 112, 92, 255], // Strong Yellowish Pink
  // [83, 55, 112, 255], // Strong Violet
  // [255, 142, 0, 255], // Vivid Orange Yellow
  // [179, 40, 81, 255], // Strong Purplish Red
  // [244, 200, 0, 255], // Vivid Greenish Yellow
  // [127, 24, 13, 255], // Strong Reddish Brown
  // [147, 170, 0, 255], // Vivid Yellowish Green
  // [89, 51, 21, 255], // Deep Yellowish Brown
  // [241, 58, 19, 255], // Vivid Reddish Orange
  // [35, 44, 22, 255], // Dark Olive Green
  // [0, 161, 194, 255] // Vivid Blue
];
