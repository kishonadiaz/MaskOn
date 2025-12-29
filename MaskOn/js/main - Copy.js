import * as THREE from "three";
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { FaceLandmarker, FilesetResolver} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm'
import { MaskRender } from './componets/MaskRender.js'

const FACE_BONE_MAP = {
    // Jaw
    "JawBone": [13, 14],          // upper lip → lower lip
    "ChinBone": [152, 13],        // chin → upper lip

    // Mouth
    "MouthCenterBone": [13, 14],
    "MouthLeftBone": [61, 291],   // left → right mouth corner
    "MouthRightBone": [291, 61],

    "UpperLipBone": [0, 13],      // nose → upper lip
    "LowerLipBone": [14, 152],    // lower lip → chin

    // Cheeks
    "CheekLeftBone": [50, 205],
    "CheekRightBone": [280, 425],

    // Nose
    "NoseBridgeBone": [168, 6],   // between eyes → nose tip
    "NoseTipBone": [6, 1],

    // Eyes
    "LeftEyeBone": [33, 133],
    "RightEyeBone": [362, 263],

    "LeftUpperEyelidBone": [159, 145],
    "LeftLowerEyelidBone": [145, 153],

    "RightUpperEyelidBone": [386, 374],
    "RightLowerEyelidBone": [374, 380],

    // Eyebrows
    "LeftBrowBone": [70, 105],
    "RightBrowBone": [300, 334],

    // Forehead / head orientation
    "ForeheadBone": [10, 168]
};

const FACE_CONNECTIONS = [
    // Jaw & mouth
    [61, 291], [13, 14], [78, 308],

    // Eyes
    [33, 133], [159, 145],
    [362, 263], [386, 374],

    // Brows
    [70, 105],
    [300, 334],

    // Nose
    [168, 6], [6, 1],

    // Face outline
    [10, 152]
];
//const AmbientLightf = (color, intensity) => {
//    const al = new THREE.AmbientLight(color, intensity);
//    return al;
//}
//const HemisphereLights = (gcolor, scolor, intensity, callback = () => { }) => {
//    const hemiLight = new THREE.HemisphereLight(gcolor, scolor, intensity);
//    callback(hemiLight);
//    return hemiLight;
//}
//const DirectionalLightf = (color, intensity, callback = () => { }) => {
//    const dirLight = new THREE.DirectionalLight(color, intensity);
//    callback(dirLight);
//    return dirLight;

//}
//AmbientLightf(0xffffff, 1)
//HemisphereLights(0xffffff, 0xffffff, 9)
//function applyBoneFromLandmarks(bone, lmA, lmB) {
//    const dir = new THREE.Vector3(
//        lmB.x - lmA.x,
//        lmB.y - lmA.y,
//        lmB.z - lmA.z
//    ).normalize();

//    const quat = new THREE.Quaternion();
//    quat.setFromUnitVectors(
//        new THREE.Vector3(0, 1, 0), // bone forward axis (adjust if needed)
//        dir
//    );

//    bone.quaternion.slerp(quat, 0.5);
//}



let Movers = await chrome.webview.hostObjects.Movers;
let CanvasMovers = await chrome.webview.hostObjects.CanvasMovers;
let maskrender = new MaskRender()
//let container = document.querySelector("#cover");
    
const video = document.getElementById("video");
//const canvas = document.getElementById("output");
//const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
//const canvascont = document.getElementById("canvascont");
//let canvascontbox = canvascont.getBoundingClientRect()
const dragger = document.getElementById("dragger")
//canvas.width = canvascontbox.width;
//canvas.height = canvascontbox.height;
let getgrabberposition = dragger.getBoundingClientRect();
//const loader = new GLTFLoader();
//const loaderfbx = new FBXLoader();
//var skeleton = new THREE.Skeleton();
//let calibrated = false;
//let calibration = { x: 0, y: 0, z: 0 };
//let Center;


//let clock, renderer, raycaster;
//let INTERSECTED;
//let theta = 0;

//clock = new THREE.Clock();

//console.log(getgrabberposition.left, getgrabberposition.top)



//const scene = new THREE.Scene();
//const facecamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//renderer = new THREE.WebGLRenderer({ antialias: true, canvas: container });




//renderer.setSize(canvascont.clientWidth, canvascont.clientHeight);
//renderer.shadowMap.enabled = true;
//canvascont.appendChild(renderer.domElement);

//const geometry = new THREE.BoxGeometry(1, 1, 1);
//const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//const cube = new THREE.Mesh(geometry, material);
////scene.add(cube);

//facecamera.position.z = 5;
//renderer.setClearColor(0x000000, 0);
//renderer.setClearAlpha(0.0);

//var modeld;

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
//loaderfbx.load(
//    'assets/Prosona.fbx', // URL/path to the FBX file
//    function (fbx) {
//        const model = fbx;

//        model.traverse(function (child) {
//            // Check if the child is a Mesh to apply specific changes (e.g., shadows, materials)

//            //console.log(child)

//            if (child.isMesh) {
//                child.castShadow = true;
//                child.receiveShadow = true;
//                console.log(child)
//                if (child.name === 'Object_2') {
//                    console.log(child, "Center");
//                    //alert("found");
//                    Center = child;

//                }
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
//        skeleton = new THREE.SkeletonHelper(modeld);
//        //const helper = new THREE.SkeletonHelper(modeld);
//        //scene.add(helper);
//        modeld.scale.set(.3, .3, .3)
//        //model.rotation.set(0,0, -.55);
//        //modeld.position.y = -26                                  ;
//        scene.add(modeld);
//    },
//    function (xhr) {
//        // Called while loading is in progress
//        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//    },
//    function (error) {
//        // Called when loading encounters an error
//        console.error('An error happened', error);
//    }
//);
//function animate() {
//    requestAnimationFrame(animate);
//    const delta = clock.getDelta();
//    //cube.rotation.x += 0.01;
//    //cube.rotation.y += 0.01;
//    //modeld.position.y -= 0.01;

//    //renderer.render(scene, camera);
//    render();

//}
//var render = () => {

//    theta += 0.1;
//    renderer.render(scene, facecamera);
//}


////const controls = new OrbitControls(facecamera, renderer.domElement);
////controls.target.set(0, 0, 0);
////controls.update();



//await Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");
//await CanvasMovers.GetData("" + canvascontbox.left + "," + canvascontbox.top, "" + canvascontbox.width + "," + canvascontbox.height + "");
//dragger.addEventListener("click", () => {
//    //alert("OK");
//})

//dragger.addEventListener("dragstart", async (e) => {
//    //e.preventDefault();
//})
//dragger.addEventListener("drag", async (e) => {
//    getgrabberposition = dragger.getBoundingClientRect();
//    canvascontbox  = canvascont.getBoundingClientRect()
//    console.log((e.pageX-dragger.getBoundingClientRect().left), e.pageY);
//    dragger.style.transform = "translate(" + (e.pageX - 790) + "px," + (e.pageY - 49) + "px)";
//    Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");
//    Movers.Moving()
//    CanvasMovers.GetData("" + canvascontbox.left + "," + canvascontbox.top, "" + canvascontbox.width + "," + canvascontbox.height + "");
//    CanvasMovers.Moving()
//})
//dragger.addEventListener("dragend", async (e) => {
//    //e.preventDefault();
//    getgrabberposition = dragger.getBoundingClientRect();
//    canvascontbox = canvascont.getBoundingClientRect()
//    Movers.StopMoving()
//    CanvasMovers.StopMoving()

//    console.log(-e.clientX, e.clientY);
//    //alert("ok")
//    //dragger.style.transform = "translate(" + -e.clientX + "px," + e.clientY + "px)";
//})
//document.addEventListener("dragover", (e => {
//    e.preventDefault()
//    getgrabberposition = dragger.getBoundingClientRect();

//    console.log((e.pageX - dragger.getBoundingClientRect().left), e.pageY);
//    dragger.style.transform = "translate(" + (e.pageX - 790) + "px," + (e.pageY - 49) + "px)";
//    Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");

//    canvascont.style.transform = "translate(" + (e.pageX - 790) + "px," + (e.pageY - 49) + "px)";
//    CanvasMovers.GetData("" + canvascontbox.left + "," + canvascontbox.top, "" + canvascontbox.width + "," + canvascontbox.height + "");

//}))
//document.addEventListener("drop",async (e) => {
//    e.preventDefault()
//    console.log(e.clientX, e.clientY);
//    //getgrabberposition = dragger.getBoundingClientRect();
//    //Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");

//    //dragger.style.transform = "translate(" + -(e.pageX) + "px," + e.pageY + "px)";
//})



//console.log(SelfieSegmentation, FaceMesh, Camera)
///* ---------------- SEGMENTATION ---------------- */
//const segmentation = new SelfieSegmentation({
//    locateFile: file =>
//        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
//});

//segmentation.setOptions({
//    modelSelection: .2,
//});

//const filesetResolver = await FilesetResolver.forVisionTasks(
//    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
//);

//const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
//    baseOptions: {
//        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
//        delegate: "GPU",
//    },
//    outputFaceBlendshapes: true,
//    runningMode: "LIVE_STREAM",
//    numFaces: 2,
//});



// //---------------- RESULTS ---------------- 
//segmentation.onResults(onSegmentation);


//function onSegmentation(results) {
//    ctx.save();
//    ctx.globalCompositeOperation = "source-over";
//    ctx.clearRect(0, 0, canvas.width, canvas.height);

//    // STEP 1: Draw the mask into alpha channel
//    ctx.globalCompositeOperation = "copy";
//    ctx.drawImage(
//        results.segmentationMask,
//        0, 0,
//        canvas.width,
//        canvas.height
//    );

//    // Keep person only
//    ctx.globalCompositeOperation = "source-in";
//    ctx.drawImage(
//        results.image,
//        0, 0, canvas.width, canvas.height
//    );

//    ctx.restore();
//}

//function faceRotation(lm) {
//    const A = lm[61];  // mouth left
//    const B = lm[291]; // mouth right
//    const C = lm[13];  // upper lip center

//    const x = vec(B).sub(vec(A)).normalize();
//    const y = vec(C).sub(vec(A)).normalize();
//    const z = new THREE.Vector3().crossVectors(x, y).normalize();

//    const mat = new THREE.Matrix4().makeBasis(x, y, z);
//    const quat = new THREE.Quaternion().setFromRotationMatrix(mat); // Fixed: removed .set

//    return { Matrix: mat, Quaternion: quat };
//}
//function calibrateFace(lm) {
//    const faceTransformg = computeFaceTransform(lm);
//    calibration.x = faceTransformg.position.x;
//    calibration.y = faceTransformg.position.y;
//    calibration.z = faceTransformg.position.z;
//    calibrated = true;
//}
//var count = 0;
//var county = -.5;
//var countz = -.5;
//var countxR = -.5;
//var countzR = .1;

//let magrx = 0;

//function lerp(a, b, t) {
//    return a + (b - a) * t;
//}

//var xc = 0;
//var eu = 0;



//function Movemask(lm) {
//    if (!modeld || !lm) return;

//    var head = modeld.getObjectByName("spine006");

//    try {
//        // Get full face transform (position, rotation, scale)
//        const faceTransform = computeFaceTransform(lm);

//        // --- Position (with coordinate adjustment) ---
//        const posX = (faceTransform.position.x * 10);
//        const posY = (faceTransform.position.y * 10);
//        const posZ = (faceTransform.position.z * 10);


//        // Smooth position movement
//        modeld.position.lerp(new THREE.Vector3(posX-count, posY-county, posZ+countz), 0.9);
//        //facecamera.position.set(posX, posY , posZ+10);


//        // --- Rotation ---
//        // Extract euler angles from quaternion
//        const eu = new THREE.Euler().setFromQuaternion(faceTransform.rotation.Quaternion, 'XYZ');

//        // Apply rotation with inverted pitch and constraints
//        let xr = Math.max(-0.65, Math.min(((eu.x)) * faceTransform.rotation.Quaternion._w/1, 0.65)); // inverted pitch
//        const yr = Math.max(-3.2, Math.min(((eu.y)) * faceTransform.rotation.Quaternion._w / 1, 2.2));    // yaw
//        let zr = Math.max(-.65, Math.min(((eu.z)) * faceTransform.rotation.Quaternion._w / 1, .65));    // roll



//        // Apply rotation (smooth lerp for stability)
//        const targetRotation = new THREE.Euler(faceTransform.rotation.Quaternion._x, -faceTransform.rotation.Quaternion._y, faceTransform.rotation.Quaternion._z);
//        const targetCRotation = new THREE.Euler(facecamera.rotation.x,-facecamera.rotation.y ,facecamera.rotation.z );
//        var r = targetRotation.x / targetRotation.z
//        console.log(r, "sdajfhkjahsjkfha");
//        if (targetRotation.y >= .4) {
//            count--;
//            //county--;
//        } else if (targetRotation.y <= -.3) {
//            count++
//        }
//        //if (targetRotation.y < -.01 ) {
//        //    targetRotation.x *= -.1
//        //    modeld.rotation.x *= -.1
//        //    targetRotation.z *= -.1
//        //    modeld.rotation.z *= -.1
//        //}



//        var dx = ((((eu.x - 5) + (eu.x - 5)))) * Math.PI/100
//        var dz = (((modeld.rotation.z - .5) + (eu.z - .5)))
//        var dy = (2 * ((modeld.rotation.y - 5) + (eu.y - 5))) + 17

//        if (modeld.rotation._z >= .04) {
//            modeld.rotation._x *= -.9
//            dx *= -.9
//            console.log("JKLKJJJLKk")
//        } else {
//            modeld.rotation._x *= .9
//            dx *= .9
//        }

//        //facecamera.rotation.y = lerp(facecamera.rotation.y, targetCRotation.y, 0.1);
//        facecamera.rotation.x = -lerp(modeld.rotation.x, targetRotation.x, 0.3);
//        //facecamera.rotation.z = lerp(modeld.rotation.z, targetRotation.z, 0.3);
//        modeld.rotation.x = lerp(modeld.rotation.x, (dx+countxR), 0.3);
//        modeld.rotation.y = lerp(modeld.rotation.y, targetRotation.y, 0.3);
//        //modeld.rotation.z = lerp(modeld.rotation.z, (dz+countzR)*.05, 0.3);

//        console.log(modeld.rotation);

//        // --- Scale ---
//        var scale = faceTransform.scale * 1.9; // Adjust multiplier as needed
//        var sc = Math.max(-0.55, Math.min(scale, 0.55));
//        modeld.scale.lerp(new THREE.Vector3(sc, sc, sc), 0.3);
//        count = posX;
//        // Optional: Check if face is centered
//        if (areEyesCentered(lm, .5)) {
//            const L = lm[33];
//            const R = lm[263];
//            const midX = (L.x + R.x) * 0.5;
//            const midY = 1.0 - ((L.y + R.y) * 0.5); // flip Y
//            county *= midY-.1
//            count *= midX + .5
//            countxR *= midY
//            countzR = (midX+midY)
//            scale += (midY/midX)
//            if (midY <= .5) {
//                county *= midY - 100
//            }else
//            if (midY >= .6) {
//                county *=.3
//            }
//            if (countzR >= .05) {
//                countzR = .05;
//            } else if (countzR >= -.05) {
//                countzR = -.05;
//            }
//            //if ((((midY + midX)/2)) > .6) {
//            //    county = ((midY + midX) / 2)
//            //} else {
//            //    county = county * midY/2
//            //}
//            county += Math.max(-.9, Math.min(county, .9))
//            countzR = Math.max(-3.5, Math.min(countzR, 3.5))
//            console.log("✔ Face centered", midY);
//        }

//    } catch (err) {
//        console.error("Movemask error:", err);
//    }
//}

////AI HELP
//function computeFaceTransform(lm) {
//    return {
//        position: facePosition(lm),
//        rotation: faceRotation(lm),
//        scale: faceScale(lm)
//    };
//}
////AI Help
//function faceScale(lm) {
//    const leftEye = vec(lm[33]);
//    const rightEye = vec(lm[263]);

//    const eyeDist = leftEye.distanceTo(rightEye);

//    return eyeDist;
//}
////AI Help
//function vec(lm, scale = 1) {
//    return new THREE.Vector3(
//        (lm.x - 0.5) * scale,
//        (0.5 - lm.y) * scale,
//        -lm.z * scale
//    );
//}
//function areEyesCentered(lm, tolerance = 0.05) {
//    const L = lm[33];
//    const R = lm[263];
//    const midX = (L.x + R.x) * 0.5;
//    const midY = 1.0 - ((L.y + R.y) * 0.5); // flip Y

//    return (
//        Math.abs(midX - 0.5) < tolerance &&
//        Math.abs(midY - 0.5) < tolerance
//    );



//}
////AI HELP
//function facePosition(lm, scale = 1) {
//    const p = new THREE.Vector3();

//    p.add(vec(lm[1]));
//    p.add(vec(lm[168]));
//    p.add(vec(lm[152]));

//    return p.multiplyScalar(1 / 3).multiplyScalar(scale);
//}

//var x = 0;
//var y = 0;
//let targetX = 0;
//let targetY = 0;
//let offsetX = 0;
//let offsetY = 0;

//function processResults(detections) {
//    const rigFaceBones = {
//        JawBone: modeld.getObjectByName("DEF-jaw"),
//        UpperLipBone: modeld.getObjectByName("DEF-lip.T"),
//        LowerLipBone: modeld.getObjectByName("DEF-lip.B"),
//        MouthLeftBone: modeld.getObjectByName("DEF-lip.L"),
//        MouthRightBone: modeld.getObjectByName("DEF-lip.R"),
//        LeftEyeBone: modeld.getObjectByName("DEF-eye.L"),
//        RightEyeBone: modeld.getObjectByName("DEF-eye.R"),
//        LeftBrowBone: modeld.getObjectByName("DEF-brow.T.L"),
//        RightBrowBone: modeld.getObjectByName("DEF-brow.T.R"),
//    };

//    if (!detections.faceLandmarks || !modeld) return;

//    try {
//        ctx.save();
//        ctx.strokeStyle = "red";
//        ctx.lineWidth = 1;

//        const L = detections.faceLandmarks[0][33];  // Left eye
//        const R = detections.faceLandmarks[0][263]; // Right eye
//        const faceTransform = computeFaceTransform(detections.faceLandmarks[0]);

//        // Calculate face center in normalized coordinates (0-1)
//        const midX = (L.x + R.x) * 0.5;
//        const midY = (L.y + R.y) * 0.5;

//        // Calculate how far from center (0.5, 0.5) the face is
//        const deltaX = (midX - 0.5) + x;  // -0.5 to +0.5 range
//        const deltaY = (midY - 0.5) + y;  // -0.5 to +0.5 range

//        // Accumulate offset to track face movement
//        // This allows the mask to follow the face across the entire canvas
//        const trackingSpeed = 0.15;  // Adjust this for faster/slower tracking
//        offsetX += deltaX * trackingSpeed;
//        offsetY += deltaY * trackingSpeed;

//        // Optional: Add damping to prevent drift over time
//        offsetX *= 0.98;  // Slowly decays toward 0
//        offsetY *= 0.98;

//        // Convert to world space with accumulated offset
//        const worldX = -(deltaX * 10) + offsetX;
//        const worldY = -((deltaY * 10) + offsetY);  // CSS already flipped
//        const worldZ = -faceTransform.scale * 5;




//        const moveSpeed = 0.5;
//        const maxOffset = 10; // Maximum units the mask can move from center

//        // Check if face is centered
//        if (areEyesCentered(detections.faceLandmarks[0], 0.4)) {
//            // Face is centered - gradually return to origin
//            targetX = lerp(targetX, - .0157, 1)
//            targetY = lerp(targetY, 0.0667, 1)
//            //console.log("✔ Face centered - resetting position");
//        }

//        // Smooth the actual position values
//        x = lerp(x, targetX, 1);
//        y = lerp(y, targetY, 1);


//        console.log(Center, ((faceTransform.position.z - .5) + (faceTransform.scale - .5)))
//        var yaction = (((midY - .45) + (midY - .45)) * 10)
//        //Center.position.lerp(new THREE.Vector3((((midX - .5) + (midX - .5)) / 10) - 0.007945, ((midY / midX) * .5) - 0.007945, -(((midY - .5) + (midY - .5)) / 10) + 0.007945), 0.3);
//        modeld.position.lerp(new THREE.Vector3((((midX - .45) + (midX - .45)) * 10) - 0.007945, -(((midY - .35) + (midY - .35)) * 10) + 0.0723, ((faceTransform.position.z + 2) + (faceTransform.scale - 2)) * 10), 0.3);
//        facecamera.position.lerp(new THREE.Vector3(-(((midX - .55) + (midX - .55)) * 10) - 0.007945, (((midY - .5) + (midY - .5)) * 10) - 0.0723, 19.2 - faceTransform.scale ^ 2), 0.3);

//        // Apply position with smooth interpolation
//        //modeld.position.lerp(new THREE.Vector3(worldX - .105, worldY - .667, worldZ -.134), 0.3);
//        //modeld.position.lerp(new THREE.Vector3((((midX - .5) + (midX - .5)) / 10) - 0.105, ((midY / midX) * .5) - 0.134, -(((midY - .5) + (midY - .5)) / 10) + 0.0677), 0.3);
//        // Calculate and apply scale based on face size
//        var scale = faceTransform.scale * 3.5; // Adjust multiplier as needed
//        scale -= ((midY / midX) * .5) * faceTransform.scale
//        //console.log(facecamera.rotation.x);
//        //Center.scale.lerp(new THREE.Vector3(0.3, .3, .3), 0.3);
//        modeld.scale.lerp(new THREE.Vector3(1, 1, .80), 0.3);
//        //Center.scale.lerp(new THREE.Vector3(1, -1, -.80 - faceTransform.scale), 0.3)
//        // Apply rotation from face transform
//        const eu = new THREE.Euler().setFromQuaternion(faceTransform.rotation.Quaternion, 'XYZ');

//        const xr = Math.max(-0.8, Math.min(((eu.x - .3) + (eu.x - .3)), 0.8));
//        const yr = Math.max(-2.2, Math.min(eu.y, 2.2));
//        const zr = Math.max(-0.1, Math.min(eu.z, 0.1));

//        console.log(Center)
//        modeld.rotation._z *= -.1
//        //Center.rotation._x = lerp(-Center.rotation._x, faceTransform.rotation.Quaternion._x*10, 0.3);
//        modeld.rotation.y = lerp(-modeld.rotation.y, faceTransform.rotation.Quaternion._y * 10, 0.3);
//        modeld.rotation.x = lerp(-modeld.rotation.x - .6, lerp(-modeld.rotation.x - .6, (eu.x - .6) * 2, 1), 0.3);
//        modeld.rotation.z = lerp(-modeld.rotation.z + .6, ((eu.z + .10) + (eu.z - .3)) * 1, 0.3);
//        if (modeld.rotation.y > .3) {
//            console.log("ok")
//            //modeld.rotation._x *= -.1
//            modeld.rotation.z *= -.1
//        }
//        if (modeld.rotation.y < -.3) {

//            //modeld.rotation._x *= -.1
//            modeld.rotation.z *= -.1
//        }
//        //if (modeld.rotation.x < -.2 && modeld.position.y > .9) {


//        //    modeld.position.y -= 1
//        //}

//        var c = ((canvas.width / 2 + canvas.height / 2) / 2) * .2
//        var mid = ((midX + midY) / 2) * 100
//        if (mid < c) {
//            modeld.position.y += (((mid) / 100) * .2) + (deltaY) * 10
//            facecamera.position.y += (((mid) / 100) * .2) + (deltaY) * 5
//            console.log("there")
//        } else {
//            facecamera.position.y -= (((mid) / 100) * .2) + (deltaY) * 5
//        }

//        if (modeld.position.z > 1.4) {
//            modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .2, (faceTransform.scale * 10) - .2, ((faceTransform.scale * 10) - .20) * .80), 1)
//            facecamera.position.y += (faceTransform.scale )+(deltaY)
//        } else {

//            modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .2, (faceTransform.scale * 10) - .2, ((faceTransform.scale * 10) - .30) * .80), 1)
//            facecamera.position.y -= (faceTransform.scale) + (deltaY)
//        }



//        console.log(modeld.scale, faceTransform.scale,"asdfljhkljh")
//        //modeld.scale.lerp(new THREE.Vector3(fa))
//        //modeld.rotation.y = lerp(-modeld.rotation.y, -yr, 0.3);
//        //modeld.rotation.z = lerp(-modeld.rotation.z, -zr, 0.3);

//        // Draw debug markers
//        ctx.beginPath();
//        ctx.arc(midX * canvas.width, midY * canvas.height, 3, 0, Math.PI * 2);
//        ctx.stroke();

//        ctx.strokeStyle = "blue";
//        ctx.beginPath();
//        ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
//        ctx.stroke();

//        ctx.restore();


//        ctx.save();
//        ctx.strokeStyle = "lime";
//        ctx.lineWidth = 1;


//        //console.log(results)
//        if (!detections) return
//        for (const [i, p] of Object.entries(detections.faceLandmarks[0])) {
//            ctx.beginPath();
//            ctx.arc(
//                p.x * canvas.width,
//                p.y * canvas.height,
//                1.3, 0, Math.PI * 2
//            );
//            ctx.stroke();

//        }
//        ctx.restore();

//        console.log(`Delta: (${deltaX.toFixed(3)}, ${deltaY.toFixed(3)}) | Offset: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})`);

//    } catch (ex) {
//        console.error(ex);
//    }
//}

///* ---------------- CAMERA ---------------- */
//const camera = new Camera(video, {
//    onFrame: async () => {
//        await segmentation.send({ image: video });
//        //const landmarks = faceLandmarker.detect(video);
//        //await faceMesh.send({ image: video });
//        const faceLandmarkerResult = faceLandmarker.detectForVideo(video, Date.now());
//        processResults(faceLandmarkerResult);
//    },
//    width: 1280,
//    height: 720
//});

//camera.start();

//if (WebGL.isWebGL2Available()) {

//    animate();

//} else {
//    console.warn(WebGL.getWebGLErrorMessage());
//}
await maskrender.Init()
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


/* ---------------- RESULTS ---------------- */
segmentation.onResults(maskrender.onSegmentation);
let camera = new Camera(video, {
    onFrame: async () => {
        await segmentation.send({ image: video });
        //const landmarks = faceLandmarker.detect(video);
        //await faceMesh.send({ image: video });
        const faceLandmarkerResult = faceLandmarker.detectForVideo(video, Date.now());
        maskrender.processResults(faceLandmarkerResult);
    },
    width: 1280,
    height: 720
});
camera.start();







maskrender.staged()