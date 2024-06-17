import React,{useState,useEffect,useRef} from 'react'


let maskKeyPointIndexs = [10, 234, 152, 454]; //overhead, left Cheek, chin, right cheek
let maskArray= [];

export default function Mask() {
    const videoRef = useRef(null);
    let videoElement;
    var faceLandmarker
    const [isVideo,setisVideo]=useState(false)
    const [ detectFace,setDetectFace]=useState(false)
    const [ masks,setMask]=useState([])
    const [ model,setModel]=useState({})
    const [ predictions,setPredictions]=useState([])
    const canvasRef = useRef(null);

   

    useEffect(() => {
        async function loadModel() {
            console.log("runing effect")
            const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
            console.log(model,"in effecf")
            setModel(model);
        }
        loadModel();
      }, []);

      useEffect(() => {
        if (isVideo) {
          navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
              videoRef.current.addEventListener("loadeddata", detectFaces);
          });
        } else {
          if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        }
      }, [isVideo]);
      console.log(model,"modl")
       
      async function detectFaces() {
        let inputElement = videoRef.current
        let flipHorizontal = isVideo;
        await model.estimateFaces
            ({
                input: inputElement,
                returnTensors: false,
                flipHorizontal: flipHorizontal,
                predictIrises: false
            }).then(predictions => {
            //console.log(predictions);
            let confident_predictions = predictions.filter(function(p) {
                return p.faceInViewConfidence > 0.5;
            });

            console.log(confident_predictions?.length,"confident predictions")
            setPredictions(confident_predictions)
            drawMask(confident_predictions);
            // if(clearMask){
            //     // clearCanvas();
            //     // clearMask = false;
            // }
            if(true){
                console.log(masks.length,"top page")
                requestAnimationFrame(detectFaces)
            }
        });
    }


    function drawMask(predictions) {

        if (maskArray.length !== predictions.length) {
            console.log("in here")
            clearCanvas();
        }
    
        const overheadIndex = 0;
        const chinIndex = 2;
        let leftCheekIndex, rightCheekIndex;

        if (isVideo) {
            leftCheekIndex = 3;
            rightCheekIndex = 1;
        } else {
                leftCheekIndex = 1;
                rightCheekIndex = 3;
            }

            if (predictions.length > 0) {
                predictions.map((prediction, x) => {
                    console.log(x,"xpoin")
                    const keypoints = prediction.scaledMesh; 
                    //  console.log(keypoints,"points")

                     let dots, maskElement;
                     console.log(maskArray.length, masks.length > x ,"top ")
                     if (maskArray.length > x ) {
                        console.log("in x")
                         dots = maskArray[x].keypoints;
                         maskElement = maskArray[x].maskElement;
                     } else {
                         dots = [];
                         maskElement = document.createElement('img');
                         maskElement.src = '/full-mask-2.png';
                         maskElement.id = 'mask_' + x;
                         maskElement.className = 'mask';
                         maskArray.push({ keypoints: dots, maskElement: maskElement });
                         console.log(maskArray,"array")
                          setMask(maskArray)
                         document.getElementById('canvas').appendChild(maskElement);
                     }
         
                    //  console.log(dots,maskElement,"checking ")

                    maskKeyPointIndexs.forEach((index, i) => {
                        const coordinate = getCoordinate(keypoints[index][0], keypoints[index][1]);
                        console.log(coordinate,"corrrd")

                        let dot;
                        if (dots.length > i) {
                            dot = dots[i];
                        } else {
                            const dotElement = document.createElement('div');
                            dotElement.className = 'dot';
                            dot = { top: 0, left: 0, element: dotElement };
                            dots.push(dot);
                        }

                        dot.left = coordinate[0];
                        dot.top = coordinate[1];
                        dot.element.style.top = dot.top + 'px';
                        dot.element.style.left = dot.left + 'px';
                        dot.element.style.position = 'absolute';



                    })

                           console.log(dots,maskArray,"checking ")
                           const maskType = 'full'
                           let maskCoordinate; 
                           let maskHeight;
                           switch (maskType) {
                            case 'full':
                                maskCoordinate = { top: dots[overheadIndex].top, left: dots[leftCheekIndex].left };
                                maskHeight = dots[chinIndex].top - dots[overheadIndex].top;
                                break;
                            case 'half':
                            default:
                                maskCoordinate = dots[leftCheekIndex];
                                maskHeight = dots[chinIndex].top - dots[leftCheekIndex].top;
                                break;
                        }

                        console.log(maskCoordinate,"mask ccor")
                        console.log(maskHeight,"mask height")
                        let  maskWidth, maskSizeAdjustmentLeft ,maskSizeAdjustmentWidth, maskSizeAdjustmentHeight , maskSizeAdjustmentTop,   maskTop,     maskLeft;

                         maskWidth = (dots[rightCheekIndex].left - dots[leftCheekIndex].left) ;
                         maskSizeAdjustmentWidth = parseFloat(1.1);
                         maskSizeAdjustmentHeight = parseFloat(1.1);
                         maskSizeAdjustmentTop = parseFloat(0);
                        if(isVideo){
                            maskSizeAdjustmentLeft = parseFloat(0);
                        }
                        else{
                            maskSizeAdjustmentLeft = 0;
                        }
                        
                        console.log(maskWidth,maskSizeAdjustmentHeight,maskSizeAdjustmentTop,"mask parameters")

                        maskTop = maskCoordinate.top - ((maskHeight * (maskSizeAdjustmentHeight-1))/2) - (maskHeight * maskSizeAdjustmentTop);
                        maskLeft = maskCoordinate.left - ((maskWidth * (maskSizeAdjustmentWidth-1))/2) - (maskWidth * maskSizeAdjustmentLeft);
                         
                        console.log(maskTop,maskLeft,"mask gop gteo")


                        maskElement.style.top = maskTop + 'px';
                        maskElement.style.left = maskLeft + 'px';
                        maskElement.style.width = maskWidth * maskSizeAdjustmentWidth + 'px';
                        maskElement.style.height = maskHeight * maskSizeAdjustmentHeight + 'px';
                        maskElement.style.position = 'absolute';

            
               


                })
            }
    
    }    

    function getCoordinate(x, y) {
        if (isVideo) {
            if (window.innerWidth / window.innerHeight >= videoRef.current.width / videoRef.current.height) {
                const ratio = document.getElementById('canvas').clientHeight / videoRef.current.height;
                const resizeX = x * ratio;
                const resizeY = y * ratio;
                return [resizeX, resizeY];
            } else {
                const leftAdjustment = videoRef.current.width - document.getElementById('canvas').clientWidth;
                const resizeX = x - leftAdjustment;
                const resizeY = y;
                return [resizeX, resizeY];
            }
        } else {
            return [x, y];
        }
    }
    
    function clearCanvas() {
        const canvas = document.getElementById('canvas');
        while (canvas.firstChild) {
            canvas.removeChild(canvas.firstChild);
        }
        maskArray = [];
    }
    
    
console.log(maskArray,masks,"arry")
      const startWebcam = async () => {
   
        setisVideo(true);
        setDetectFace(true);
      };
  return (
    <div>
          
              <h5 onClick={startWebcam}>start</h5>
              <div id="canvas"></div>
              <video ref={videoRef} style={{ display: isVideo ? 'block' : 'none' }} className="relative -z-50"/>
              <img src="/full-mask-2.png" data-mask-type="full-mask" data-scale-width="1.2" data-scale-height="1.2" data-top-adj="0.05" data-left-adj="0.02" className='h-44 w-44'/>

             


              

    </div>
  )
}
