import * as THREE from "three";
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { FaceLandmarker, FilesetResolver} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm'

let Movers = await chrome.webview.hostObjects.Movers;

let container = document.querySelector("#cover");
    
const video = document.getElementById("video");
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
const canvascont = document.getElementById("canvascont");
const canvascontbox = canvascont.getBoundingClientRect()
const dragger = document.getElementById("dragger")
canvas.width = canvascontbox.width;
canvas.height = canvascontbox.height;
let getgrabberposition = dragger.getBoundingClientRect();
const loader = new GLTFLoader();
const loaderfbx = new FBXLoader();

let clock, renderer, raycaster;
let INTERSECTED;
let theta = 0;

clock = new THREE.Clock();

console.log(getgrabberposition.left, getgrabberposition.top)



const scene = new THREE.Scene();
const facecamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

renderer = new THREE.WebGLRenderer({ antialias: true, canvas: container });




renderer.setSize(canvascont.clientWidth, canvascont.clientHeight);
renderer.shadowMap.enabled = true;
canvascont.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

facecamera.position.z = 5;
renderer.setClearColor(0x000000, 0);
renderer.setClearAlpha(0.0);

var modeld;

//loader.load(
//    // resource URL
//    'assets/scene.gltf', // or .glb
//    // called when the resource is loaded
//    function (gltf) {
//        const model = gltf.scene;

//        model.traverse(function (child) {
//            // Check if the child is a Mesh to apply specific changes (e.g., shadows, materials)
//            if (child.isMesh) {
//                child.castShadow = true;
//                child.receiveShadow = true;
//                console.log(child)
                                
//                // Example: Change material properties (must be done carefully if materials are shared)
//                // If you want to change *all* materials to a new one:
//                // child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
//            }

//            // You can also check for other object types like Light
//            if (child.isLight) {
//                child.castShadow = true;
//            }
//        });
//        modeld = model
//        modeld.scale.set(25, 25, 25)
//        modeld.position.y = -1                                   ;
//        scene.add(model);
//        // You can also access animations, cameras, etc. from gltf.animations, gltf.cameras, etc.
//    },
//    // called while loading is progressing
//    function (xhr) {
//        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//    },
//    // called when loading has errors
//    function (error) {
//        console.error('An error happened', error);
//    }
//);
loaderfbx.load(
    'assets/BatManMask.fbx', // URL/path to the FBX file
    function (fbx) {
        const model = fbx;

        model.traverse(function (child) {
            // Check if the child is a Mesh to apply specific changes (e.g., shadows, materials)
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                console.log(child)

                // Example: Change material properties (must be done carefully if materials are shared)
                // If you want to change *all* materials to a new one:
                // child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            }

            // You can also check for other object types like Light
            if (child.isLight) {
                child.castShadow = true;
            }
        });
        modeld = model
        //const helper = new THREE.SkeletonHelper(modeld);
        //scene.add(helper);
        modeld.scale.set(.3, .3, .3)
        modeld.position.y = -2                                   ;
        scene.add(modeld);
    },
    function (xhr) {
        // Called while loading is in progress
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        // Called when loading encounters an error
        console.error('An error happened', error);
    }
);
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;
    //modeld.position.y -= 0.01;

    //renderer.render(scene, camera);
    render();

}
var render = () => {

    theta += 0.1;
    renderer.render(scene, facecamera);
}


const controls = new OrbitControls(facecamera, renderer.domElement);
controls.target.set(0, 0, 0);
// controls.minDistance = 500;
// controls.maxDistance = 1500;
controls.update();



await Movers.GetData(""+getgrabberposition.left+","+getgrabberposition.top,""+getgrabberposition.width+","+getgrabberposition.height+"");
dragger.addEventListener("click", () => {
    //alert("OK");
})

dragger.addEventListener("dragstart", async (e) => {
    //e.preventDefault();
})
dragger.addEventListener("drag", async (e) => {
    getgrabberposition = dragger.getBoundingClientRect();
    console.log((e.pageX-dragger.getBoundingClientRect().left), e.pageY);
    dragger.style.transform = "translate(" + (e.pageX - 790) + "px," + (e.pageY - 49) + "px)";
    Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");
    Movers.Moving()
})
dragger.addEventListener("dragend", async (e) => {
    //e.preventDefault();
    getgrabberposition = dragger.getBoundingClientRect();
     Movers.StopMoving()

    console.log(-e.clientX, e.clientY);
    //alert("ok")
    //dragger.style.transform = "translate(" + -e.clientX + "px," + e.clientY + "px)";
})
document.addEventListener("dragover", (e => {
    e.preventDefault()
    getgrabberposition = dragger.getBoundingClientRect();
    console.log((e.pageX - dragger.getBoundingClientRect().left), e.pageY);
    dragger.style.transform = "translate(" + (e.pageX - 790) + "px," + (e.pageY - 49) + "px)";
    Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");
    canvascont.style.transform = "translate(" + (e.pageX - 790) + "px," + (e.pageY - 49) + "px)";

}))
document.addEventListener("drop",async (e) => {
    e.preventDefault()
    console.log(e.clientX, e.clientY);
    //getgrabberposition = dragger.getBoundingClientRect();
    //Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");

    //dragger.style.transform = "translate(" + -(e.pageX) + "px," + e.pageY + "px)";
})



console.log(SelfieSegmentation, FaceMesh, Camera)
/* ---------------- SEGMENTATION ---------------- */
const segmentation = new SelfieSegmentation({
    locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
});

segmentation.setOptions({
    modelSelection: .2,
});

const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
);

const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "LIVE_STREAM",
    numFaces: 2,
});

//await faceLandmarker.setOptions({ runningMode: "VIDEO" });

/* ---------------- FACE MESH ---------------- */
//const faceMesh = new FaceMesh({
//    locateFile: file =>
//        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
//});

//faceMesh.setOptions({
//    maxNumFaces: 1,
//    refineLandmarks: true,
//    minDetectionConfidence: 0.6,
//    minTrackingConfidence: 0.6
//});

/* ---------------- RESULTS ---------------- */
segmentation.onResults(onSegmentation);
//faceMesh.onResults(onFaceResults);

function onSegmentation(results) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // STEP 1: Draw the mask into alpha channel
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(
        results.segmentationMask,
        0, 0,
        canvas.width,
        canvas.height
    );

    // Keep person only
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(
        results.image,
        0, 0, canvas.width, canvas.height
    );

    ctx.restore();
}

//function onFaceResults(results) {
//    try {
//        if (!results.multiFaceLandmarks) return;

//        ctx.save();
//        ctx.strokeStyle = "lime";
//        ctx.lineWidth = 1;


//        //console.log(results)
//        if (!results) return
//        for (const [i, p] of Object.entries(results.multiFaceLandmarks[0])) {
//            ctx.beginPath();
//            ctx.arc(
//                p.x * canvas.width,
//                p.y * canvas.height,
//                1.3, 0, Math.PI * 2
//            );
//            ctx.stroke();
//        }
//        ctx.restore();
//    } catch (ex) {

//    }
//}
function processResults(detections) {

    console.log(detections)
    try {
        if (!detections.faceLandmarks) return;

        ctx.save();
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 1;


        //console.log(results)
        if (!detections) return
        for (const [i, p] of Object.entries(detections.faceLandmarks[0])) {
            ctx.beginPath();
            ctx.arc(
                p.x * canvas.width,
                p.y * canvas.height,
                1.3, 0, Math.PI * 2
            );
            ctx.stroke();
        }
        ctx.restore();
    } catch (ex) {
        console.log(ex)
    }
}
/* ---------------- CAMERA ---------------- */
const camera = new Camera(video, {
    onFrame: async () => {
        await segmentation.send({ image: video });
        //const landmarks = faceLandmarker.detect(video);
        //await faceMesh.send({ image: video });
        const faceLandmarkerResult = faceLandmarker.detectForVideo(video, Date.now());
        processResults(faceLandmarkerResult);
    },
    width: 1280,
    height: 720
});

camera.start();

if (WebGL.isWebGL2Available()) {

    animate();

} else {
    console.warn(WebGL.getWebGLErrorMessage());
}