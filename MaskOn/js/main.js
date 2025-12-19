

let Movers = await chrome.webview.hostObjects.Movers;



    
const video = document.getElementById("video");
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
const canvascont = document.getElementById("canvascont");
const canvascontbox = canvascont.getBoundingClientRect()
const dragger = document.getElementById("dragger")
canvas.width = canvascontbox.width;
canvas.height = canvascontbox.height;
let getgrabberposition = dragger.getBoundingClientRect();

console.log(getgrabberposition.left, getgrabberposition.top)

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
    modelSelection: 1,
});

/* ---------------- FACE MESH ---------------- */
const faceMesh = new FaceMesh({
    locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

/* ---------------- RESULTS ---------------- */
segmentation.onResults(onSegmentation);
faceMesh.onResults(onFaceResults);

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

function onFaceResults(results) {
    try {
        if (!results.multiFaceLandmarks) return;

        ctx.save();
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 1;


        console.log(results.multiFaceLandmarks)
        if (!results) return
        for (const [i, p] of Object.entries(results.multiFaceLandmarks[0])) {
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

    }
}

/* ---------------- CAMERA ---------------- */
const camera = new Camera(video, {
    onFrame: async () => {
        await segmentation.send({ image: video });
        await faceMesh.send({ image: video });
    },
    width: 1280,
    height: 720
});

camera.start();

