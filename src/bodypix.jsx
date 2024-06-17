import React ,{useRef} from 'react'
import image from "./assets/bg.jpeg";






export default function Bodypix() {
    const videoRef = useRef(null);
    var videoElement  = videoRef.current;
    const canvasRef = useRef(null);

    const backgroundImage = new Image(480, 270);
    backgroundImage.src = image;
    backgroundImage.height=720
    backgroundImage.width=1280

    const BodyPixModel = 'MobileNetV1';

    async function startWebCamStream() {
        videoElement = videoRef.current;
        try {
            // Start the webcam stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;

            // Wait for the video to play
            await videoElement.play();
        } catch (error) {
            console.log(error,"error")
         }
    }


    async function startVirtualBackground() {
          videoElement = videoRef.current;
        try{
            // canvasElement.width = 300;
            // canvasElement.height = 300;
             console.log(bodyPix,"poix")
            let net =  await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16, // Output stride (16 or 32). 16 is faster, 32 is more accurate.
                multiplier: 0.75, // The model's depth multiplier. Options: 0.50, 0.75, or 1.0.
                quantBytes: 2,// The number of bytes to use for quantization (4 or 2).
            });

            console.log(net,"netttt")



            async function updateCanvas() {

            
            const segmentation = await net.segmentPerson(videoElement, {
                flipHorizontal: false, // Whether to flip the input video horizontally
                internalResolution: 'medium', // The resolution for internal processing (options: 'low', 'medium', 'high')
                segmentationThreshold: 0.7, // Segmentation confidence threshold (0.0 - 1.0)
                maxDetections: 10, // Maximum number of detections to return
                scoreThreshold: 0.2, // Confidence score threshold for detections (0.0 - 1.0)
                nmsRadius: 20, // Non-Maximum Suppression (NMS) radius for de-duplication
                minKeypointScore: 0.3, // Minimum keypoint detection score (0.0 - 1.0)
                refineSteps: 10, // Number of refinement steps for segmentation
                opacity:0.7
                
            });

            console.log(segmentation,"segmenee")
            const background = { r: 0, g: 0, b: 0, a: 0 };
            const mask = bodyPix.toMask(segmentation, background, { r: 0, g: 0, b: 0, a: 255 });

            
            console.log(mask,"maskkkk")

            const canvasElement = canvasRef.current; 
            const ctx = canvasElement?.getContext("2d")
             
            const maskBlurAmount = 5; // Adjust the blur amount as needed
            const opacity = 0.5; 



            if (mask) {
                // ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                // const coloredPartImage = bodyPix.toMask(segmentation);
                // const opacity = 0.7;
            
                // const maskBlurAmount = 0;
                // bodyPix.drawMask(
                //     canvasElement,  backgroundImage, mask, opacity, maskBlurAmount,
                    
                // );
                // ctx.drawImage(
                //     videoElement, 0, 0,700,700)
                // const imgData = ctx.getImageData(
                //     0, 0, 700,700)

                // const pixels = imgData.data
                // console.log(pixels,"pixels")
                // for (let i = 0; i < pixels.length; i += 4) {
                //     if (segmentation.data[i / 4] === 0) {
                //     pixels[i + 3] = 0
                //     }
                // }
                // console.log(imgData,"image data")
                // ctx.putImageData(imgData, 0, 0)

                    

                /// OLD
                // ctx.putImageData(mask, 0, 0);
                // ctx.globalCompositeOperation = 'source-in';

                // // 3. Drawing the Background
                // if (backgroundImage.complete) {
                //     ctx.drawImage(backgroundImage, 0, 0, 1000, 1000);
                // } else {
                //     // If the image is not loaded yet, wait for it to load and then draw
                //     backgroundImage.onload = () => {
                //         ctx.drawImage(backgroundImage, 0, 0, 1000, 1000);
                //     };
                // }

                // // Draw the mask (segmentation)
                // ctx.globalCompositeOperation = 'destination-over';
                // ctx.drawImage(videoElement, 0, 0, 1000, 1000);
                // ctx.globalCompositeOperation = 'source-over';

                // Add a delay to control the frame rate (adjust as needed) less CPU intensive
                // await new Promise((resolve) => setTimeout(resolve, 100));

                // Continue updating the canvas




                /// NEW
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                   
                // Draw the background image first
                if (backgroundImage.complete) {
                    ctx.drawImage(backgroundImage, 0, 0, 1000, 1000);
                } else {
                    backgroundImage.onload = () => {
                        ctx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
                    };
                }

                // Draw the mask with blur and opacity
          
                bodyPix.drawMask(canvasElement, videoElement, mask, opacity, maskBlurAmount);
                   

                // R
            }
                requestAnimationFrame(updateCanvas);
            }




            updateCanvas();


        }catch(e){
            console.log(e)
        }
    }

  return (
    <div className='w-full flex flex-col items-center py-6'>
            <button onClick={startVirtualBackground}>Start</button>
            <button onClick={startWebCamStream}>cam</button>
         <video autoplay className='bg-black ' width="1280px" height="720px" ref={videoRef}/>
        
         <canvas id="canvas" width="1280px" height="720px" ref={canvasRef} ></canvas>


      
    </div>

  )
}
