import * as THREE from "three";
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { FaceLandmarker, FilesetResolver} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm'
import { MaskRender } from './componets/MaskRender.js'




let Movers = await chrome.webview.hostObjects.Movers;
let CanvasMovers = await chrome.webview.hostObjects.CanvasMovers;
let Settings = await chrome.webview.hostObjects.Settings;

let maskrender = new MaskRender()

    
const video = document.getElementById("video");

const dragger = document.getElementById("dragger")

let getgrabberposition = dragger.getBoundingClientRect();
const canvascont = document.getElementById("canvascont");
let canvascontbox = canvascont.getBoundingClientRect()
let settingsBtn = document.getElementById("settings");




await Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");
await CanvasMovers.GetData("" + canvascontbox.left + "," + canvascontbox.top, "" + canvascontbox.width + "," + canvascontbox.height + "");



settingsBtn.addEventListener("click", async (e) => {


    maskrender.editing = !maskrender.editing
    //console.log(Settings.Open())
    //if (Settings.Open() == "true") {

    //} else {
    //    //alert("d")
    //    Settings.Close()
    //}

})

dragger.addEventListener("click", () => {
    //alert("OK");
})

dragger.addEventListener("dragstart", async (e) => {
    //e.preventDefault();
})
dragger.addEventListener("drag", async (e) => {
    getgrabberposition = dragger.getBoundingClientRect();
    canvascontbox  = canvascont.getBoundingClientRect()
    console.log((e.pageX-dragger.getBoundingClientRect().left), e.pageY);
    dragger.style.transform = "translate(" + (e.pageX - 790) + "px," + (e.pageY - 49) + "px)";
    Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");
    Movers.Moving()
    CanvasMovers.GetData("" + canvascontbox.left + "," + canvascontbox.top, "" + canvascontbox.width + "," + canvascontbox.height + "");
    CanvasMovers.Moving()
})
dragger.addEventListener("dragend", async (e) => {
    //e.preventDefault();
    getgrabberposition = dragger.getBoundingClientRect();
    canvascontbox = canvascont.getBoundingClientRect()
    Movers.StopMoving()
    CanvasMovers.StopMoving()

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
    CanvasMovers.GetData("" + canvascontbox.left + "," + canvascontbox.top, "" + canvascontbox.width + "," + canvascontbox.height + "");

}))
document.addEventListener("drop",async (e) => {
    e.preventDefault()
    console.log(e.clientX, e.clientY);
    //getgrabberposition = dragger.getBoundingClientRect();
    //Movers.GetData("" + getgrabberposition.left + "," + getgrabberposition.top, "" + getgrabberposition.width + "," + getgrabberposition.height + "");

    //dragger.style.transform = "translate(" + -(e.pageX) + "px," + e.pageY + "px)";
})

try {

    await maskrender.Init()
    const segmentation = new SelfieSegmentation({
        locateFile: file =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    });

    segmentation.setOptions({
        modelSelection: .2,
    });

    const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
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
} catch (ex) {

}