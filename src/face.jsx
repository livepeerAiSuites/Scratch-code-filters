import React,{useState,useEffect,useRef} from 'react'
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';




  
const glassesKeyPoints = { midEye: 168, leftEye: 143, noseBottom: 2, rightEye: 372 };
let camera;
let obControls;
let glassesArray = [];
let clearglasses = false;
let cameraFrame = null;


export default function Face() {
  const videoRef = useRef(null);
  const canvasRef= useRef(null);
  const [ model,setModel]=useState({})
  const rendererRef = useRef(new THREE.WebGLRenderer({  alpha: true }));
  const sceneRef = useRef(new THREE.Scene());
  const [isVideo, setIsVideo] = useState(false);
  const [detectFace, setDetectFace] = useState(false);


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

  useEffect(() => {
      setup3dScene()
      setup3dCamera()
      setup3dGlasses()
  }, []);








  function setup3dScene(){
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(rendererRef.current.domElement);

    var frontLight = new THREE.SpotLight( 0xffffff, 0.3 );
    frontLight.position.set( 10, 10, 10 );
    sceneRef.current.add( frontLight );
    var backLight = new THREE.SpotLight( 0xffffff, 0.3  );
    backLight.position.set( 10, 10, -10)
    sceneRef.current.add(backLight);
}


function setup3dCamera(){ 
  if(isVideo){
    camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 2000 );
    let videoWidth =videoRef.current.width;
    let videoHeight = videoRef.current.height;
    camera.position.x = videoWidth / 2;
    camera.position.y = -videoHeight / 2;
    camera.position.z = -( videoHeight / 2 ) / Math.tan( 45 / 2 ); 
    camera.lookAt( { x: videoWidth / 2, y: -videoHeight / 2, z: 0, isVector3: true } );
    rendererRef.current.setSize(videoWidth, videoHeight);
    rendererRef.current.setClearColor(0x000000, 0);


    console.log(videoHeight,videoWidth,"Width hei")
    
 }else{  
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        camera.position.set(0, 0, 1.5);
        camera.lookAt(sceneRef.current.position);
        rendererRef.current.setSize( window.innerWidth, window.innerHeight );
        rendererRef.current.setClearColor( 0x3399cc, 1 ); 
        obControls = new OrbitControls(camera, rendererRef.current.domElement);  
  }

  let cameraExists = false;
  sceneRef.current.children.forEach(function(child){
      if(child.type=='PerspectiveCamera'){
          cameraExists = true;
      }
  });
  if(!cameraExists){
      camera.add( new THREE.PointLight( 0xffffff, 0.8 ) );
      sceneRef.current.add( camera );
  }
  setup3dAnimate();

  console.log(camera,"camer")
 }


 async function setup3dGlasses(){
  return new Promise(resolve => {
      var threeType ='gltf';
      if(threeType == 'gltf'){
          var gltfLoader = new GLTFLoader();
          gltfLoader.setPath('/3dmodel/glasses-01/');
          gltfLoader.load("scene.gltf", function ( object ) {
              object.scene.position.set(0,0.5,0);
              var scale =0.01;
              if(window.innerWidth < 480){
                  scale = scale * 0.5;
              }
              object.scene.scale.set(scale, scale,scale);
              sceneRef.current.add( object.scene );
              glassesArray.push(object.scene);
              resolve('loaded');        
          });
      }
  });
}

console.log(glassesArray,"Array")


 var setup3dAnimate = function () {
  if(!isVideo){
      requestAnimationFrame( setup3dAnimate );
      obControls.update();
  }
  rendererRef.current.render(sceneRef.current, camera);
};



function clearCanvas(){
  for( var i = sceneRef.current.children.length - 1; i >= 0; i--) { 
      var obj = sceneRef.current.children[i];
      if(obj.type=='Group'){
          sceneRef.current.remove(obj);
      }
  }
  rendererRef.current.render(sceneRef.current, camera);
  glassesArray = [];
}

async function detectFaces() {
  let inputElement = videoRef.current;
  let flipHorizontal = !isVideo;
  
  await model.estimateFaces
  ({
      input: inputElement,
      returnTensors: false,
      flipHorizontal: flipHorizontal,
      predictIrises: false
  }).then(faces => {
      //console.log(faces);
      drawglasses(faces).then(() => {
          if(clearglasses){
              clearCanvas();
              clearglasses = false;
          }
          if(detectFace){
              cameraFrame = window.requestAnimationFrame(detectFaces)
          }
      });
  });
}


const startWebcam = async () => {
   
  setIsVideo(true);
  setDetectFace(true);
};

async function drawglasses(faces){
     console.log(faces.length,"lenght of face")
      if(isVideo && (glassesArray.length != faces.length) ){
          clearCanvas();
          for (let j = 0; j < faces.length; j++) {
              await setup3dGlasses();
          }
      }   


      for (let i = 0; i < faces.length; i++) {
        let glasses = glassesArray[i];
        let face = faces[i];
        if(typeof glasses !== "undefined" && typeof face !== "undefined")
        {
            let pointMidEye = face.scaledMesh[ glassesKeyPoints.midEye ];
            let pointleftEye = face.scaledMesh[ glassesKeyPoints.leftEye ];
            let pointNoseBottom = face.scaledMesh[ glassesKeyPoints.noseBottom ];
            let pointrightEye = face.scaledMesh[ glassesKeyPoints.rightEye ];

            glasses.position.x = pointMidEye[ 0 ];
            glasses.position.y = -pointMidEye[ 1 ] + parseFloat(10);
            glasses.position.z = -camera.position.z + pointMidEye[ 2 ];

            glasses.up.x = pointMidEye[ 0 ] - pointNoseBottom[ 0 ];
            glasses.up.y = -( pointMidEye[ 1 ] - pointNoseBottom[ 1 ] );
            glasses.up.z = pointMidEye[ 2 ] - pointNoseBottom[ 2 ];
            const length = Math.sqrt( glasses.up.x ** 2 + glasses.up.y ** 2 + glasses.up.z ** 2 );
            glasses.up.x /= length;
            glasses.up.y /= length;
            glasses.up.z /= length;

            const eyeDist = Math.sqrt(
                ( pointleftEye[ 0 ] - pointrightEye[ 0 ] ) ** 2 +
                ( pointleftEye[ 1 ] - pointrightEye[ 1 ] ) ** 2 +
                ( pointleftEye[ 2 ] - pointrightEye[ 2 ] ) ** 2
            );

            glasses.scale.x = eyeDist * parseFloat(0.01) ;
            glasses.scale.y = eyeDist * parseFloat(0.01) ;
            glasses.scale.z = eyeDist * parseFloat(0.01) ;

            glasses.rotation.y = Math.PI;
            glasses.rotation.z = Math.PI / 2 - Math.acos( glasses.up.x );
            
            rendererRef.current.render(sceneRef.current, camera);
        }
    }


}
  return (
    <div className='w-full flex flex-col items-center py-6'>
             <img src={"/3dmodel/glasses-01/glasses_01.png"} />
            <button onClick={startWebcam}>Start</button>
         <video autoplay className='bg-black h-56 relative -z-50' width="1280px" height="720px"  ref={videoRef} />
         <canvas id="canvas" width="1280px" height="720px" ref={canvasRef} ></canvas>



      
    </div>
  )
}
