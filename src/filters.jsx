import React,{useState,useEffect,useRef} from 'react'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

const glassesKeyPoints = { midEye: 168, leftEye: 143, noseBottom: 2, rightEye: 372 };
let camera;

export default function Filters() {


    const [isVideo, setIsVideo] = useState(false);
    const [selectedGlasses, setSelectedGlasses] = useState(null);
    const [glassesArray, setGlassesArray] = useState([]);
    const [detectFace, setDetectFace] = useState(false);
    const webcamRef = useRef(null);
    const [model, setModel] = useState(null);
    const [cameraFrame, setCameraFrame] = useState(null);

    const videoRef =  useRef(null);
    const canvasRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef();
    const rendererRef = useRef(new THREE.WebGLRenderer({ alpha: true }));
    const controlsRef = useRef();



    useEffect(() => {
        async function loadModel() {
      
          const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
          
          setModel(model);
        }
        loadModel();
      }, []);

      console.log(model,"modlll")


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
        const canvas = canvasRef.current;
        const scene = sceneRef.current;
        const renderer = rendererRef.current;
    
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvas.appendChild(renderer.domElement);
    
        if (isVideo) {
          cameraRef.current = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
        } else {
          cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          controlsRef.current = new OrbitControls(cameraRef.current, renderer.domElement);
        }


        var frontLight = new THREE.SpotLight( 0xffffff, 0.3 );
        frontLight.position.set( 10, 10, 10 );
        scene.add( frontLight );
        var backLight = new THREE.SpotLight( 0xffffff, 0.3  );
        backLight.position.set( 10, 10, -10)
        scene.add(backLight);


        
        const animate = () => {
          requestAnimationFrame(animate);
          if (controlsRef.current) {
            controlsRef.current.update();
          }
          renderer.render(scene, cameraRef.current);
        };
        animate();
    
      }, [isVideo]);


      useEffect(() => {
        if (selectedGlasses && !isVideo) {
          const loader = new GLTFLoader();
          loader.load(selectedGlasses.modelPath, (gltf) => {
            const model = gltf.scene;
            model.position.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            sceneRef.current.add(model);
            
            setGlassesArray([model]);
          });
        }
      }, [selectedGlasses]);
    

      console.log(glassesArray,"array of glasses")



      const detectFaces = async () => {
   
        const faces = await model.estimateFaces({
          input: videoRef.current,
          returnTensors: false,
          flipHorizontal: false,
          predictIrises: false
        });

        console.log(faces,"face>>>>>>>>>")

        // Process faces and position the glasses
        for (const face of faces) {
          const pointMidEye = face.scaledMesh[glassesKeyPoints.midEye];
          const pointLeftEye = face.scaledMesh[glassesKeyPoints.leftEye];
          const pointNoseBottom = face.scaledMesh[glassesKeyPoints.noseBottom];
          const pointRightEye = face.scaledMesh[glassesKeyPoints.rightEye];

          glassesArray.forEach((glasses) => {
            glasses.position.set(pointMidEye[0], -pointMidEye[1], pointMidEye[2]);
            glasses.up.set(
              pointMidEye[0] - pointNoseBottom[0],
              -(pointMidEye[1] - pointNoseBottom[1]),
              pointMidEye[2] - pointNoseBottom[2]
            );

            const length = Math.sqrt(
              glasses.up.x ** 2 + glasses.up.y ** 2 + glasses.up.z ** 2
            );
            glasses.up.x /= length;
            glasses.up.y /= length;
            glasses.up.z /= length;

            const eyeDist = Math.sqrt(
              (pointLeftEye[0] - pointRightEye[0]) ** 2 +
              (pointLeftEye[1] - pointRightEye[1]) ** 2 +
              (pointLeftEye[2] - pointRightEye[2]) ** 2
            );

            const scale = parseFloat(selectedGlasses.scale) || 1;
            glasses.scale.set(eyeDist * scale, eyeDist * scale, eyeDist * scale);
            glasses.rotation.y = Math.PI;
            glasses.rotation.z = Math.PI / 2 - Math.acos(glasses.up.x);
          });
        }

        if (detectFace) {
          requestAnimationFrame(detectFaces);
        }
      };
    




  const startWebcam = async () => {
   
    setIsVideo(true);
    setDetectFace(true);
  };

    console.log(selectedGlasses,"glasses")
  
  return (
    <div>
         <GlassesSelector onSelectGlasses={setSelectedGlasses} />
          <h5 onClick={startWebcam}>start</h5>
           <video ref={videoRef} style={{ display: isVideo ? 'block' : 'none' }} />;
           <canvas id="canvas" width="1280px" height="720px" ref={canvasRef} ></canvas>

          


    </div>
  )
}










const GlassesSelector = ({ onSelectGlasses }) => {
    return (
      <div className='flex items-center space-x-4'>
        {[{
            src: '/3dmodel/glasses-01/glasses_01.png', 
            modelPath: '/3dmodel/glasses-01/scene.gltf' ,


        },
        {
            src: '/3dmodel/glasses-02/glasses_02.png', 
            modelPath: '/3dmodel/glasses-02/scene.gltf' 
        }
    ].map((glasses) => (
          <img 
            key={glasses.id} 
            src={glasses.src} 
            alt="glasses" 
            onClick={() => onSelectGlasses(glasses)} 
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    );
  };
  