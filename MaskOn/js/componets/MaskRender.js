import * as THREE from "three";
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm'
//import { lerp } from "three/src/math/MathUtils";

import { TransformControls } from 'three/addons/controls/TransformControls.js';


export class MaskRender {
    //this = this 
    constructor() {
        this.editing = false;
        this.container 
        this.video 
        this.canvas 
        this.ctx 
        this.canvascont 
        this.canvascontbox 
        this.clicked = false;
        this.masktype = ""
        this.masktypes = ["halfmask","fullmask","eyemask"]
        this.storedmasks = ["BatManMask", "Prosona"]
        this.currentType = ""
        this.maskheight = 0;

        this.loader 
        this.loaderfbx 
        this.skeleton 
        this.calibrated 
        this.calibration 
        this.Center;
        this.raycaster 
        this.mouse
        this.moveX = 0;

        this.clock
        this.renderer;
        this.INTERSECTED;
        this.theta = 0;
        this.count = 0;
        this.county = -.5;
        this.countz = -.5;
        this.countxR = -.5;
        this.countzR = .1;

        this.magrx = 0;


        this.xc = 0;
        this.eu = 0;

        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.oldVectorPos = new  THREE.Vector3(0,0,0)

        this.scene
        this.faceLandmarker 
        this.facecamera
        this.geometry
        this.Center;

        this.material
        this.cube
        this.modeld = {};
        this.orbitcontols = {};
        this.gimbalcontrols = {};
        this.gizmo;

        this.FACE_BONE_MAP = {
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

        this.FACE_CONNECTIONS = [
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
        //this = this;
    }
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    onDocumentMouseDown = (event) => {
        event.preventDefault();

        // Get the bounding box of the canvas
        const rect = this.renderer.domElement.getBoundingClientRect();

        // Calculate normalized device coordinates (-1 to +1)
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1; // Y is inverted in Three.js

        this.clicked = true;

        // Call the function to check for intersections
        this.checkIntersections();
    }
    checkIntersections = () => {
        // Update the picking ray with the camera and mouse position
        //this.raycaster.setFromCamera(this.mouse, this.facecamera);

        //// Calculate objects intersecting the picking ray
        //// 'scene.children' is often used, but it's more performant to
        //// specify an array of specific objects you want to check.
        //// The second argument (optional) is a boolean to recursively check children.
        //const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        //if (intersects.length > 0) {
        //    // An object was clicked
        //    const clickedObject = intersects[0].object;
        //    console.log('Clicked object:', clickedObject.name);
        //    clickedObject.position.y += this.mouse.y ; // Example: move the clicked object slightly based on mouse Y
        //    // Example: change the color of the clicked object
        //    clickedObject.material.color.set(0xff0000);
        //} else {
        //    // No object was clicked
        //    console.log('No object clicked');
        //}
    }
    AmbientLightf = (color, intensity) => {
        const al = new THREE.AmbientLight(color, intensity);
        return al;
    }
    HemisphereLights = (gcolor, scolor, intensity, callback = () => { }) => {
        const hemiLight = new THREE.HemisphereLight(gcolor, scolor, intensity);
        callback(hemiLight);
        return hemiLight;
    }
    DirectionalLightf = (color, intensity, callback = () => { }) => {
        const dirLight = new THREE.DirectionalLight(color, intensity);
        callback(dirLight);
        return dirLight;

    }

    applyBoneFromLandmarks(bone, lmA, lmB) {
        const dir = new THREE.Vector3(
            lmB.x - lmA.x,
            lmB.y - lmA.y,
            lmB.z - lmA.z
        ).normalize();

        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0), // bone forward axis (adjust if needed)
            dir
        );

        bone.quaternion.slerp(quat, 0.5);
    }
    animate = ()=> {
        requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();
        //cube.rotation.x += 0.01;
        //cube.rotation.y += 0.01;
        //modeld.position.y -= 0.01;
        this.modeld.updateMatrixWorld(true);
        this.gimbalcontrols.update()
        
        if (this.editing) {
            this.gizmo.visible = true
          
         
        } else {
            //this.container.style.transform = "scaleX(-1)"
            this.gizmo.visible = false
        }
        //renderer.render(scene, camera);
        this.render();

    }
    render = () => {

        this.theta += 0.1;
        if(this.renderer)
        this.renderer.render(this.scene, this.facecamera);
    }
    Init = async () => {



        
        this.container = document.querySelector("#cover");
        this.video = document.getElementById("video");
        this.canvas = document.getElementById("output");
        this.ctx = this.canvas.getContext("2d", { alpha: true, willReadFrequently: false });
        this.canvascont = document.getElementById("canvascont");
        this.canvascontbox = canvascont.getBoundingClientRect()



        this.loader = new GLTFLoader();
        this.loaderfbx = new FBXLoader();
        this.skeleton = new THREE.Skeleton();
        this.calibrated = false;
        this.calibration = { x: 0, y: 0, z: 0 };
        this.Center;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();


        this.canvas.width = this.canvascontbox.width;
        this.canvas.height = this.canvascontbox.height;
        this.canvas.width = this.canvascontbox.width;
        this.canvas.height = this.canvascontbox.height;
        this.Amb =this.AmbientLightf(0xffffff, 1)
        this.Hemi = this.HemisphereLights(0xffffff, 0xffffff, .7)
        this.Dir = this.DirectionalLightf(0xffffff, 2, (dirLight) => {
            dirLight.position.set(1, 10, 10);
            dirLight.rotation.set(-5,0,0)
            dirLight.castShadow = true;
            dirLight.shadow.camera.top = 2;
            dirLight.shadow.camera.bottom = - 2;
            dirLight.shadow.camera.left = - 2;
            dirLight.shadow.camera.right = 2;
            dirLight.shadow.camera.near = 0.1;
            dirLight.shadow.camera.far = 40;
        })
        console.log(this.Hemi, this.Amb, this.Dir)

       


        this.clock = new THREE.Clock();

        /* ---------------- SEGMENTATION ---------------- */

       

        this.scene = new THREE.Scene();
        this.facecamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });


        this.scene.add(this.Hemi)
        this.scene.add(this.Amb)
        this.scene.add(this.Dir)

        this.renderer.setSize(this.canvascont.clientWidth, this.canvascont.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.canvascont.appendChild(this.renderer.domElement);

        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.cube);

        this.facecamera.position.z = 5;
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setClearAlpha(0.0);

        //this.orbitcontols = new OrbitControls(this.facecamera, this.renderer.domElement);
        //this.orbitcontols.update();
        //this.orbitcontols.addEventListener('change', this.renderer);
        this.gimbalcontrols = new TransformControls(this.facecamera, this.renderer.domElement);
        this.gimbalcontrols.setSpace('world');

        this.gimbalcontrols.addEventListener('objectChange', () => {
            //this.gimbalcontrols.object.position.y *= -1;
            //this.gimbalcontrols.object.position.x *= -1;

        });
        
        this.gimbalcontrols.addEventListener('change', () => {
            this.renderer.render(this.scene, this.facecamera);
        });
        
        
      


        //this.gimbalcontrols.object.position.z *= -1;
        //this.gimbalcontrols.object.position.x *= -1;
        //let originalPosition;
        //let originalRotation;
        //let originalScale;

        //this.gimbalcontrols.addEventListener('mouseDown', function () {
        //    // Save the object's state at the beginning of the transform action
        //    if (this.gimbalcontrols.object) {
        //        originalPosition = this.gimbalcontrols.object.position.clone();
        //        originalRotation = this.gimbalcontrols.object.rotation.clone();
        //        originalScale = this.gimbalcontrols.object.scale.clone();
        //    }
        //});

        // Example function to reverse (cancel) the current action
        //function cancelTransform() {
        //    if (this.gimbalcontrols.object && originalPosition && originalRotation && originalScale) {
        //        this.gimbalcontrols.object.position.copy(originalPosition);
        //        this.gimbalcontrols.object.rotation.copy(originalRotation);
        //        this.gimbalcontrols.object.scale.copy(originalScale);

        //        // Optional: Detach controls to stop further interaction until re-attached
        //        this.gimbalcontrols.detach();
        //    }
        //}

        //// Attach a keydown listener to trigger the cancel function (e.g., using the Escape key)
        //document.addEventListener('keydown', (event) => {
        //    if (event.key === 'Escape') {
        //        cancelTransform();
        //    }
        //});
        //this.gizmo.rotation.z *= -1;
        //this.gizmo.rotation.x *= -1;
        //this.gizmo.rotation.y *= -1;
        //this.gizmo.position.y *= -1;



        //this.gizmo.traverse(function (child) {

        //    //child.scale.z *= -1
        //    //child.traverse(function (c) {
        //    //    c.scale.z *= -1
        //    //})
        //    //console.log(child)
        //})
        console.log(this.gizmo)

        this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();

            // Calculate normalized device coordinates (-1 to +1)
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1; // Y is inverted in Three.js
            if(this.clicked)
                this.checkIntersections();

        }, false);
        this.renderer.domElement.addEventListener('mouseup', () => {
            this.clicked= false;
        }, false);

        var self = this;
        this.loaderfbx.load(
            './../assets/Prosona.fbx', // URL/path to the FBX file
            (fbx)=> {
                const model = fbx;
                
                model.traverse(function (child) {
                    // Check if the child is a Mesh to apply specific changes (e.g., shadows, materials)

                    //console.log(child)

                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        //console.log(child)
                        if (child.name === 'Center') {
                            console.log(child, "Center");
                            //alert("found");
                            self.Center = child;
                            console.log(self.gimbalcontrols)
                            
                        }
                        self.Center.traverse(function (cj) {
                            
                            if (cj.name == "BatManMask") {
                                self.currentType = self.masktypes[0]
                                console.log(cj, "kjsfaldkjlkasjdfklfjsda")
                                self.maskheight = .0677
                            } else if (cj.name == "Prosona") {
                                self.currentType = self.masktypes[2]
                                self.maskheight = .0312
                            } else if (cj.name == "Flash") {
                                self.currentType = self.masktypes[1]
                                self.maskheight = .131
                            } else if (cj.name == "Ashela") {
                                self.currentType = self.masktypes[1]
                                self.maskheight = .0472
                            }
                        })
                       
                        // Example: Change material properties (must be done carefully if materials are shared)
                        // If you want to change *all* materials to a new one:
                        // child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    }

                    // You can also check for other object types like Light
                    if (child.isLight) {
                        child.castShadow = true;
                    }
                });
                console.log(model);
                self.modeld = model
                self.skeleton = new THREE.SkeletonHelper(self.modeld);
                //const helper = new THREE.SkeletonHelper(modeld);
                //scene.add(helper);
                self.modeld.scale.set(.3, .3, .3)
                //model.rotation.set(0,0, -.55);
                //modeld.position.y = -26                                  ;

                self.scene.add(self.modeld);


                if (self.editing) {
                    

                }
               
                this.gimbalcontrols.attach(self.modeld);




                this.gizmo = this.gimbalcontrols.getHelper();
                this.scene.add(this.gizmo);
                this.gizmo.visible = false
                console.log(this.gizmo)

                if (self.modeld) {
                   
                }
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
        this.gimbalcontrols.addEventListener('dragging-changed',  (event)=> {

            console.log("here in dragging");
            if (this.modeld) {
                this.oldVectorPos.x = this.modeld.position.x / 10
                this.oldVectorPos.y = this.modeld.position.y / 10
                console.log(this.oldVectorPos, "SDD")
            }
            //this.orbitcontols.enabled = !event.value;

        });
        document.addEventListener('keydown', function (event) {

            switch (event.key) {

                case 'q':
                    this.gimbalcontrols.setSpace(this.gimbalcontrols.space === 'local' ? 'world' : 'local');
                    break;

                case 'Shift':
                    this.gimbalcontrols.setTranslationSnap(1);
                    this.gimbalcontrols.setRotationSnap(THREE.MathUtils.degToRad(15));
                    this.gimbalcontrols.setScaleSnap(0.25);
                    break;

                case 'w':
                    this.gimbalcontrols.setMode('translate');
                    break;

                case 'e':
                    this.gimbalcontrols.setMode('rotate');
                    break;

                case 'r':
                    this.gimbalcontrols.setMode('scale');
                    break;

                case 'c':
                    //const position = currentCamera.position.clone();

                    //currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                    //currentCamera.position.copy(position);

                    //orbit.object = currentCamera;
                    //control.camera = currentCamera;

                    //currentCamera.lookAt(orbit.target.x, orbit.target.y, orbit.target.z);
                    //onWindowResize();
                    break;

                case 'v':
                    //const randomFoV = Math.random() + 0.1;
                    //const randomZoom = Math.random() + 0.1;

                    //cameraPersp.fov = randomFoV * 160;
                    //cameraOrtho.bottom = - randomFoV * 500;
                    //cameraOrtho.top = randomFoV * 500;

                    //cameraPersp.zoom = randomZoom * 5;
                    //cameraOrtho.zoom = randomZoom * 5;
                    //onWindowResize();
                    break;

                case '+':
                case '=':
                    this.gimbalcontrols.setSize(this.gimbalcontrols.size + 0.1);
                    break;

                case '-':
                case '_':
                    this.gimbalcontrols.setSize(Math.max(this.gimbalcontrols.size - 0.1, 0.1));
                    break;

                case 'x':
                    this.gimbalcontrols.showX = !this.gimbalcontrols.showX;
                    break;

                case 'y':
                    this.gimbalcontrols.showY = !this.gimbalcontrols.showY;
                    break;

                case 'z':
                    this.gimbalcontrols.showZ = !this.gimbalcontrols.showZ;
                    break;

                case ' ':
                    this.gimbalcontrols.enabled = !this.gimbalcontrols.enabled;
                    break;

                case 'Escape':
                    this.gimbalcontrols.reset();
                    break;

            }

        });

        window.addEventListener('keyup', function (event) {

            switch (event.key) {

                case 'Shift':
                    this.gimbalcontrols.setTranslationSnap(null);
                    this.gimbalcontrols.setRotationSnap(null);
                    this.gimbalcontrols.setScaleSnap(null);
                    break;

            }

        });

        /* ---------------- CAMERA ---------------- */
        
    }

    maskActionsBasedOntypes = (faceTransform,deltaX,deltaY,midX,midY) => {

        if (!this.modeld || !this.facecamera) return;
        console.log(this.maskheight * 10,this.currentType)
        if (this.currentType == this.masktypes[0]) {
            if (this.modeld.position.z > 1.4) {
                this.modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .2, ((faceTransform.scale * 10) - .2), ((faceTransform.scale * 10) - .20) * .80), 1)
                this.facecamera.position.y += (faceTransform.scale) + (deltaY) - ((midX + midY) / 2) - faceTransform.position.y - this.maskheight.toFixed(2) * 10
                this.modeld.position.y += (faceTransform.scale) + (deltaY) - ((midX + midY) / 2) + faceTransform.position.y - this.maskheight.toFixed(2) * 10 //.667
            } else {

                this.modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .2, (faceTransform.scale * 10) - .2, ((faceTransform.scale * 10) - .40) * .80), 1)
                this.facecamera.position.y -= (faceTransform.scale) + (deltaY) - ((midX + midY) / 2) + (faceTransform.position.y) + this.maskheight.toFixed(3) * 10
                this.modeld.position.y -= (faceTransform.scale) + (deltaY) - ((midX + midY) / 2) + (faceTransform.position.y) + this.maskheight.toFixed(2) * 10
            }
        }
        else if (this.currentType == this.masktypes[1]) {
            if (this.modeld) {
                if (this.modeld.position.z > 1.4) {
                    this.modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .07, ((faceTransform.scale * 10) - .2), ((faceTransform.scale * 10) - .20) * .80), 1)
                    this.facecamera.position.y -= ((faceTransform.scale + faceTransform.position.y) + (deltaY) - ((midX + midY) / 2) + faceTransform.position.y + this.maskheight.toFixed(2) * 10)+this.oldVectorPos.y/10
                    this.modeld.position.y -= (faceTransform.scale) + (deltaY) - ((midY+.09)+(midY+.09)) - faceTransform.position.y + this.maskheight.toFixed(2) * 10
                    this.modeld.rotation.x *= .10
                    //this.modeld.position.z -=this.lerp(this.modeld.position.z, -((faceTransform.scale ) *10)+.132,.3)

                } else {
                    console.log("here")
                    this.modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .02, (faceTransform.scale * 10) - .2, ((faceTransform.scale * 10) - .40) * .80), 1)
                    this.facecamera.position.y -= ((faceTransform.scale) + (deltaY) - ((midX + midY) / 2) + (faceTransform.position.y) - this.maskheight.toFixed(2) * 10)+ this.oldVectorPos.y/10
                    this.modeld.position.y -= (faceTransform.scale) + (deltaY) - ((midY + .09) + (midY + .09)) - (faceTransform.position.y) - this.maskheight.toFixed(2) * 10 + this.oldVectorPos.y / 100
                    this.modeld.rotation.x *= .10
                    //this.modeld.position.z -= ((faceTransform.scale ) *10)+1.32
                }
            }

            //if (this.modeld.position.y != (midX + midY) / 2) {
            //    console.log("HERE GOOG ")
            //    this.facecamera.position.y += (midX + midY) / 2
            //}
        }
        else if (this.currentType == this.masktypes[2]) {
            if (this.modeld.position.z > 1.4) {
                this.modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .2, ((faceTransform.scale * 10) - .2), ((faceTransform.scale * 10) - .20) * .80), 1)
                this.facecamera.position.y -= ((faceTransform.scale) + (deltaY) - ((midX + midY) / 2) + faceTransform.position.y + this.maskheight.toFixed(2) * 10)
                this.modeld.position.y += (faceTransform.scale) + (deltaY) + ((midX + midY) / 2) + faceTransform.position.y + this.maskheight.toFixed(2) * 10
                this.modeld.rotation.x *= .10
            } else {

                this.modeld.scale.lerp(new THREE.Vector3((faceTransform.scale * 10) - .2, (faceTransform.scale * 10) - .2, ((faceTransform.scale * 10) - .40) * .80), 1)
                this.facecamera.position.y -= (faceTransform.scale) + (deltaY) - ((midX + midY) / 2) + (faceTransform.position.y) + this.maskheight.toFixed(2) * 10
                this.modeld.position.y -= (faceTransform.scale) + (deltaY) - ((midX + midY) / 2) +(faceTransform.position.y) - this.maskheight.toFixed(2) * 10
                this.modeld.rotation.x *=.10
            }
        }


        
        
    }

    onSegmentation = async (results) => {
        this.ctx.save();
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // STEP 1: Draw the mask into alpha channel
        this.ctx.globalCompositeOperation = "copy";
        this.ctx.drawImage(
            results.segmentationMask,
            0, 0,
            this.canvas.width,
            this.canvas.height
        );

        // Keep person only
        this.ctx.globalCompositeOperation = "source-in";
        this.ctx.drawImage(
            results.image,
            0, 0, this.canvas.width, this.canvas.height
        );

        this.ctx.restore();
    }

    faceRotation = (lm) => {
        const A = lm[61];  // mouth left
        const B = lm[291]; // mouth right
        const C = lm[13];  // upper lip center

        const x = this.vec(B).sub(this.vec(A)).normalize();
        const y = this.vec(C).sub(this.vec(A)).normalize();
        const z = new THREE.Vector3().crossVectors(x, y).normalize();

        const mat = new THREE.Matrix4().makeBasis(x, y, z);
        const quat = new THREE.Quaternion().setFromRotationMatrix(mat); // Fixed: removed .set

        return { Matrix: mat, Quaternion: quat };
    }
    calibrateFace(lm) {
        const faceTransformg = computeFaceTransform(lm);
        this.calibration.x = faceTransformg.position.x;
        this.calibration.y = faceTransformg.position.y;
        this.calibration.z = faceTransformg.position.z;
        this.calibrated = true;
    }

    //Movemask(lm) {
    //    if (!this.modeld || !lm) return;

    //    var head = modeld.getObjectByName("spine006");

    //    try {
    //        // Get full face transform (position, rotation, scale)
    //        const faceTransform = computeFaceTransform(lm);

    //        // --- Position (with coordinate adjustment) ---
    //        const posX = (faceTransform.position.x * 10);
    //        const posY = (faceTransform.position.y * 10);
    //        const posZ = (faceTransform.position.z * 10);


    //        // Smooth position movement
    //        modeld.position.lerp(new THREE.Vector3(posX - count, posY - county, posZ + countz), 0.9);
    //        //facecamera.position.set(posX, posY , posZ+10);


    //        // --- Rotation ---
    //        // Extract euler angles from quaternion
    //        const eu = new THREE.Euler().setFromQuaternion(faceTransform.rotation.Quaternion, 'XYZ');

    //        // Apply rotation with inverted pitch and constraints
    //        let xr = Math.max(-0.65, Math.min(((eu.x)) * faceTransform.rotation.Quaternion._w / 1, 0.65)); // inverted pitch
    //        const yr = Math.max(-3.2, Math.min(((eu.y)) * faceTransform.rotation.Quaternion._w / 1, 2.2));    // yaw
    //        let zr = Math.max(-.65, Math.min(((eu.z)) * faceTransform.rotation.Quaternion._w / 1, .65));    // roll



    //        // Apply rotation (smooth lerp for stability)
    //        const targetRotation = new THREE.Euler(faceTransform.rotation.Quaternion._x, -faceTransform.rotation.Quaternion._y, faceTransform.rotation.Quaternion._z);
    //        const targetCRotation = new THREE.Euler(facecamera.rotation.x, -facecamera.rotation.y, facecamera.rotation.z);
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



    //        var dx = ((((eu.x - 5) + (eu.x - 5)))) * Math.PI / 100
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
    //        modeld.rotation.x = lerp(modeld.rotation.x, (dx + countxR), 0.3);
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
    //            county *= midY - .1
    //            count *= midX + .5
    //            countxR *= midY
    //            countzR = (midX + midY)
    //            scale += (midY / midX)
    //            if (midY <= .5) {
    //                county *= midY - 100
    //            } else
    //                if (midY >= .6) {
    //                    county *= .3
    //                }
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
        //AI HELP
    computeFaceTransform(lm) {
        return {
            position: this.facePosition(lm),
            rotation: this.faceRotation(lm),
            scale: this.faceScale(lm)
        };
    }
    //AI Help
    faceScale(lm) {
        const leftEye = this.vec(lm[33]);
        const rightEye = this.vec(lm[263]);

        const eyeDist = leftEye.distanceTo(rightEye);

        return eyeDist;
    }
    //AI Help
    vec(lm, scale = 1) {
        return new THREE.Vector3(
            (lm.x - 0.5) * scale,
            (0.5 - lm.y) * scale,
            -lm.z * scale
        );
    }
    areEyesCentered(lm, tolerance = 0.05) {
        const L = lm[33];
        const R = lm[263];
        const midX = (L.x + R.x) * 0.5;
        const midY = 1.0 - ((L.y + R.y) * 0.5); // flip Y

        return (
            Math.abs(midX - 0.5) < tolerance &&
            Math.abs(midY - 0.5) < tolerance
        );



    }
    //AI HELP
    facePosition(lm, scale = 1) {
        const p = new THREE.Vector3();

        p.add(this.vec(lm[1]));
        p.add(this.vec(lm[168]));
        p.add(this.vec(lm[152]));

        return p.multiplyScalar(1 / 3).multiplyScalar(scale);
    }
    processResults = (detections)=> {
        //const rigFaceBones = {
        //    JawBone: modeld.getObjectByName("DEF-jaw"),
        //    UpperLipBone: modeld.getObjectByName("DEF-lip.T"),
        //    LowerLipBone: modeld.getObjectByName("DEF-lip.B"),
        //    MouthLeftBone: modeld.getObjectByName("DEF-lip.L"),
        //    MouthRightBone: modeld.getObjectByName("DEF-lip.R"),
        //    LeftEyeBone: modeld.getObjectByName("DEF-eye.L"),
        //    RightEyeBone: modeld.getObjectByName("DEF-eye.R"),
        //    LeftBrowBone: modeld.getObjectByName("DEF-brow.T.L"),
        //    RightBrowBone: modeld.getObjectByName("DEF-brow.T.R"),
        //};
        if (this.editing) return
        if (!detections.faceLandmarks || !this.modeld) return;

        try {
            this.ctx.save();
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 1;

            const L = detections.faceLandmarks[0][33];  // Left eye
            const R = detections.faceLandmarks[0][263]; // Right eye
            const faceTransform = this.computeFaceTransform(detections.faceLandmarks[0]);

            // Calculate face center in normalized coordinates (0-1)
            const midX = (L.x + R.x) * 0.5;
            const midY = (L.y + R.y) * 0.5;

            // Calculate how far from center (0.5, 0.5) the face is
            const deltaX = (midX - 0.5) + this.x;  // -0.5 to +0.5 range
            const deltaY = (midY - 0.5) + this.y;  // -0.5 to +0.5 range

            // Accumulate offset to track face movement
            // This allows the mask to follow the face across the entire canvas
            const trackingSpeed = 0.15;  // Adjust this for faster/slower tracking
            this.offsetX += deltaX * trackingSpeed;
            this.offsetY += deltaY * trackingSpeed;

            // Optional: Add damping to prevent drift over time
            this.offsetX *= 0.98;  // Slowly decays toward 0
            this.offsetY *= 0.98;

            // Convert to world space with accumulated offset
            const worldX = -(deltaX * 10) + this.offsetX;
            const worldY = -((deltaY * 10) + this.offsetY);  // CSS already flipped
            const worldZ = -faceTransform.scale * 5;




            const moveSpeed = 0.5;
            const maxOffset = 10; // Maximum units the mask can move from center

            // Check if face is centered
            if (this.areEyesCentered(detections.faceLandmarks[0], 0.4)) {
                // Face is centered - gradually return to origin
                this.targetX = this.lerp(this.targetX, - .0157, 1)
                this.targetY = this.lerp(this.targetY, this.maskheight, 1)
                //console.log("✔ Face centered - resetting position");
            }

            // Smooth the actual position values
            this.x = this.lerp(this.x, this.targetX, 1);
            this.y = this.lerp(this.y, this.targetY, 1);


            //console.log(this.Center)
            //console.log(Center, ((faceTransform.position.z - .5) + (faceTransform.scale - .5)))
            var yaction = (((midY - .45) + (midY - .45)) * 10)
            //Center.position.lerp(new THREE.Vector3((((midX - .5) + (midX - .5)) / 10) - 0.007945, ((midY / midX) * .5) - 0.007945, -(((midY - .5) + (midY - .5)) / 10) + 0.007945), 0.3);
            this.modeld.position.lerp(new THREE.Vector3(-((((midX - .45) + (midX - .45)) * 10) - 0.007945)+this.oldVectorPos.x*10, -((((midY - .35) + (midY - .35)) * 10) - 0.0723)+this.oldVectorPos.y*10, ((faceTransform.position.z + 2) + (faceTransform.scale - 2)) * 10), 0.3);
            this.facecamera.position.lerp(new THREE.Vector3((((midX - .55) + (midX - .55)) * 10) - 0.007945, (((midY - .5) + (midY - .5)) * 10) - 0.0723, 19.2 - faceTransform.scale ^ 2), 0.3);
            //this.Center.position.lerp(new THREE.Vector3(2000, 2000, 1000), 0.3)
            // Apply position with smooth interpolation
            //modeld.position.lerp(new THREE.Vector3(worldX - .105, worldY - .667, worldZ -.134), 0.3);
            //modeld.position.lerp(new THREE.Vector3((((midX - .5) + (midX - .5)) / 10) - 0.105, ((midY / midX) * .5) - 0.134, -(((midY - .5) + (midY - .5)) / 10) + 0.0677), 0.3);
            // Calculate and apply scale based on face size
            var scale = faceTransform.scale * 3.5; // Adjust multiplier as needed
            scale -= ((midY / midX) * .5) * faceTransform.scale
            //console.log(facecamera.rotation.x);
            //Center.scale.lerp(new THREE.Vector3(0.3, .3, .3), 0.3);
            this.modeld.scale.lerp(new THREE.Vector3(1, 1, .80), 0.3);
            //Center.scale.lerp(new THREE.Vector3(1, -1, -.80 - faceTransform.scale), 0.3)
            // Apply rotation from face transform
            const eu = new THREE.Euler().setFromQuaternion(faceTransform.rotation.Quaternion, 'XYZ');

            const xr = Math.max(-0.8, Math.min(((eu.x - .3) + (eu.x - .3)), 0.8));
            const yr = Math.max(-2.2, Math.min(eu.y, 2.2));
            const zr = Math.max(-0.1, Math.min(eu.z, 0.1));

            //console.log(Center)
            this.modeld.rotation._z *= -.1
            //Center.rotation._x = lerp(-Center.rotation._x, faceTransform.rotation.Quaternion._x*10, 0.3);
            this.modeld.rotation.y = this.lerp(this.modeld.rotation.y, -faceTransform.rotation.Quaternion._y, 0.3);
            //this.facecamera.rotation.y = this.lerp(this.facecamera.rotation.y, -faceTransform.rotation.Quaternion._y, 0.3);

            this.modeld.rotation.x = this.lerp(-this.modeld.rotation.x - .6, this.lerp(-this.modeld.rotation.x - .6, (eu.x - .6) * 2, 1), 0.3);
            this.modeld.rotation.z = this.lerp(this.modeld.rotation.z - .6, -((eu.z + .10) + (eu.z - .3)) * 1, 0.3);
            if (this.modeld.rotation.y > .3) {
                console.log("ok")
                this.modeld.rotation.x *= -.1
                this.modeld.rotation.z *= -.1
            } else
            if (this.modeld.rotation.y < -.3) {

                    //modeld.rotation._x *= -.1
                    this.modeld.rotation.z *= -.1
            } else {
                //this.modeld.rotation.x *= -1
                //this.modeld.rotation.z *=.9
            }
            //if(this.modeld.rotation )
            //if (modeld.rotation.x < -.2 && modeld.position.y > .9) {


            //    modeld.position.y -= 1
            //}

            var c = ((this.canvas.width / 2 + this.canvas.height / 2) / 2) * .2
            var mid = ((midX + midY) / 2) * 100
            if (mid < c) {
                this.modeld.position.y += (((mid) / 100) * .2) + (deltaY) * 10
                this.facecamera.position.y += (((mid) / 100) * .2) + (deltaY) * 5
                //console.log("there")
            } else {
                this.facecamera.position.y -= (((mid) / 100) * .2) + (deltaY) * 5
            }

           
            this.maskActionsBasedOntypes(faceTransform, deltaX, deltaY, midX, midY);
            console.log(this.modeld.position, "kkkk")


            //this.modeld.position.x = this.oldVectorPos.x 
            //this.facecamera.position.x = this.oldVectorPos.x 
            //console.log(this.modeld.position, this.modeld.rotation)

            //if (this.modeld.position.y != (midX + midY) / 2) {
            //    this.y += (midX+midY)/2
            //}

            //console.log(modeld.scale, faceTransform.scale, "asdfljhkljh")
            //modeld.scale.lerp(new THREE.Vector3(fa))
            //modeld.rotation.y = lerp(-modeld.rotation.y, -yr, 0.3);
            //modeld.rotation.z = lerp(-modeld.rotation.z, -zr, 0.3);
          
            //this.modeld.rotation.z -= this.lerp(this.modeld.rotation.z, Math.max(-2.2, Math.min(-faceTransform.rotation.Quaternion._z * 10, 2.2)) - 2, .3);
            //if (this.modeld.rotation.y <= -.05 && this.modeld.rotation.z <= -0.09) {
            //    //this.modeld.rotation.z *= -1+deltaY
            //    //this.modeld.rotation.y -= this.lerp(this.modeld.rotation.y, Math.max(-1.2, Math.min(-faceTransform.rotation.Quaternion._y * 10, 2.2)) - 2, 1)
            //    //this.modeld.rotation.z *= -.9
            //    console.log("String")
            //} else {


            //}
            //if (this.modeld.rotation.y < -.3) {

            //    //modeld.rotation._x *= -.1
            //    this.modeld.rotation.z *= -.1
            //}
            //if (this.modeld.rotation.y > .3 && this.modeld.rotation.x <= -.02 && this.modeld.rotation.z <= -.02) {
            //    console.log("ok")
            //    //modeld.rotation._x *= -.1
            //    this.modeld.rotation.z *= -.1
            //}
            //if (this.modeld.rotation.z > .5) {
            //    //this.modeld.rotation.z = -1.7
            //}
            //if (this.modeld.rotation.y <= -.35 && this.modeld.rotation.x >= .004 && this.modeld.rotation.z >= .004) {
            //    this.modeld.rotation.y *= -.1
            //    this.modeld.rotation.z *= -.1
            //}
           
         
            console.log(this.modeld.rotation.z,this.modeld.rotation.y,this.modeld.rotation.z)
            // Draw debug markers
            this.ctx.beginPath();
            this.ctx.arc(midX * this.canvas.width, midY * this.canvas.height, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.strokeStyle = "blue";
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.restore();


            this.ctx.save();
            this.ctx.strokeStyle = "lime";
            this.ctx.lineWidth = 1;


            //console.log(results)
            //if (!detections) return
            //for (const [i, p] of Object.entries(detections.faceLandmarks[0])) {
            //    this.ctx.beginPath();
            //    this.ctx.arc(
            //        p.x * this.canvas.width,
            //        p.y * this.canvas.height,
            //        1.3, 0, Math.PI * 2
            //    );
            //    this.ctx.stroke();

            //}
            //this.ctx.restore();
     

            //console.log(`Delta: (${deltaX.toFixed(3)}, ${deltaY.toFixed(3)}) | Offset: (${this.offsetX.toFixed(2)}, ${this.offsetY.toFixed(2)})`);

        } catch (ex) {
            console.error(ex);
        }
    }

    processResultsC = (detections) => {
        //const rigFaceBones = {
        //    JawBone: modeld.getObjectByName("DEF-jaw"),
        //    UpperLipBone: modeld.getObjectByName("DEF-lip.T"),
        //    LowerLipBone: modeld.getObjectByName("DEF-lip.B"),
        //    MouthLeftBone: modeld.getObjectByName("DEF-lip.L"),
        //    MouthRightBone: modeld.getObjectByName("DEF-lip.R"),
        //    LeftEyeBone: modeld.getObjectByName("DEF-eye.L"),
        //    RightEyeBone: modeld.getObjectByName("DEF-eye.R"),
        //    LeftBrowBone: modeld.getObjectByName("DEF-brow.T.L"),
        //    RightBrowBone: modeld.getObjectByName("DEF-brow.T.R"),
        //};
        if (this.editing) return
        if (!detections.faceLandmarks || !this.modeld) return;

        try {
            this.ctx.save();
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 1;

            const L = detections.faceLandmarks[0][33];  // Left eye
            const R = detections.faceLandmarks[0][263]; // Right eye
            const faceTransform = this.computeFaceTransform(detections.faceLandmarks[0]);

            // Calculate face center in normalized coordinates (0-1)
            const midX = (L.x + R.x) * 0.5;
            const midY = (L.y + R.y) * 0.5;

            // Calculate how far from center (0.5, 0.5) the face is
            const deltaX = (midX - 0.5) + this.x;  // -0.5 to +0.5 range
            const deltaY = (midY - 0.5) + this.y;  // -0.5 to +0.5 range

            // Accumulate offset to track face movement
            // This allows the mask to follow the face across the entire canvas
            const trackingSpeed = 0.15;  // Adjust this for faster/slower tracking
            this.offsetX += deltaX * trackingSpeed;
            this.offsetY += deltaY * trackingSpeed;

            // Optional: Add damping to prevent drift over time
            this.offsetX *= 0.98;  // Slowly decays toward 0
            this.offsetY *= 0.98;

            // Convert to world space with accumulated offset
            const worldX = -(deltaX * 10) + this.offsetX;
            const worldY = -((deltaY * 10) + this.offsetY);  // CSS already flipped
            const worldZ = -faceTransform.scale * 5;




            const moveSpeed = 0.5;
            const maxOffset = 10; // Maximum units the mask can move from center

            // Check if face is centered
            if (this.areEyesCentered(detections.faceLandmarks[0], 0.4)) {
                // Face is centered - gradually return to origin
                this.targetX = this.lerp(this.targetX, - .0157, 1)
                this.targetY = this.lerp(this.targetY, .0312, 1)
                //console.log("✔ Face centered - resetting position");
            }

            // Smooth the actual position values
            this.x = this.lerp(this.x, this.targetX, 1);
            this.y = this.lerp(this.y, this.targetY, 1);


            //console.log(this.Center)
            //console.log(Center, ((faceTransform.position.z - .5) + (faceTransform.scale - .5)))
            var yaction = (((midY - .45) + (midY - .45)) * 10)
            //Center.position.lerp(new THREE.Vector3((((midX - .5) + (midX - .5)) / 10) - 0.007945, ((midY / midX) * .5) - 0.007945, -(((midY - .5) + (midY - .5)) / 10) + 0.007945), 0.3);
            this.modeld.position.lerp(new THREE.Vector3((((midX - .45) + (midX - .45)) * 10) - 0.007945, -(((midY - .35) + (midY - .35)) * 10) - 0.0723, ((faceTransform.position.z + 2) + (faceTransform.scale - 2)) * 10), 0.3);
            this.facecamera.position.lerp(new THREE.Vector3(-(((midX - .55) + (midX - .55)) * 10) - 0.007945, (((midY - .5) + (midY - .5)) * 10) - 0.0723, 19.2 - faceTransform.scale ^ 2), 0.3);
            //this.Center.position.lerp(new THREE.Vector3(2000, 2000, 1000), 0.3)
            // Apply position with smooth interpolation
            //modeld.position.lerp(new THREE.Vector3(worldX - .105, worldY - .667, worldZ -.134), 0.3);
            //modeld.position.lerp(new THREE.Vector3((((midX - .5) + (midX - .5)) / 10) - 0.105, ((midY / midX) * .5) - 0.134, -(((midY - .5) + (midY - .5)) / 10) + 0.0677), 0.3);
            // Calculate and apply scale based on face size
            var scale = faceTransform.scale * 3.5; // Adjust multiplier as needed
            scale -= ((midY / midX) * .5) * faceTransform.scale
            //console.log(facecamera.rotation.x);
            //Center.scale.lerp(new THREE.Vector3(0.3, .3, .3), 0.3);
            this.modeld.scale.lerp(new THREE.Vector3(1, 1, .80), 0.3);
            //Center.scale.lerp(new THREE.Vector3(1, -1, -.80 - faceTransform.scale), 0.3)
            // Apply rotation from face transform
            const eu = new THREE.Euler().setFromQuaternion(faceTransform.rotation.Quaternion, 'XYZ');

            const xr = Math.max(-0.8, Math.min(((eu.x - .3) + (eu.x - .3)), 0.8));
            const yr = Math.max(-2.2, Math.min(eu.y, 2.2));
            const zr = Math.max(-0.1, Math.min(eu.z, 0.1));

            //console.log(Center)
            this.modeld.rotation._z *= -.1
            //Center.rotation._x = lerp(-Center.rotation._x, faceTransform.rotation.Quaternion._x*10, 0.3);
            this.modeld.rotation.y = this.lerp(-this.modeld.rotation.y, faceTransform.rotation.Quaternion._y * 10, 0.3);
            this.modeld.rotation.x = this.lerp(-this.modeld.rotation.x - .6, this.lerp(-this.modeld.rotation.x - .6, (eu.x - .6) * 2, 1), 0.3);
            this.modeld.rotation.z = this.lerp(-this.modeld.rotation.z + .6, ((eu.z + .10) + (eu.z - .3)) * 1, 0.3);
            if (this.modeld.rotation.y > .3) {
                console.log("ok")
                //modeld.rotation._x *= -.1
                this.modeld.rotation.z *= -.1
            }
            if (this.modeld.rotation.y < -.3) {

                //modeld.rotation._x *= -.1
                this.modeld.rotation.z *= -.1
            }
            if (this.modeld.rotation.z)
                //if (modeld.rotation.x < -.2 && modeld.position.y > .9) {


                //    modeld.position.y -= 1
                //}

                var c = ((this.canvas.width / 2 + this.canvas.height / 2) / 2) * .2
            var mid = ((midX + midY) / 2) * 100
            if (mid < c) {
                this.modeld.position.y += (((mid) / 100) * .2) + (deltaY) * 10
                this.facecamera.position.y += (((mid) / 100) * .2) + (deltaY) * 5
                //console.log("there")
            } else {
                this.facecamera.position.y -= (((mid) / 100) * .2) + (deltaY) * 5
            }


            this.maskActionsBasedOntypes(faceTransform, deltaX, deltaY, midX, midY);
            //console.log(this.modeld.position, this.modeld.rotation)

            //if (this.modeld.position.y != (midX + midY) / 2) {
            //    this.y += (midX+midY)/2
            //}

            //console.log(modeld.scale, faceTransform.scale, "asdfljhkljh")
            //modeld.scale.lerp(new THREE.Vector3(fa))
            //modeld.rotation.y = lerp(-modeld.rotation.y, -yr, 0.3);
            //modeld.rotation.z = lerp(-modeld.rotation.z, -zr, 0.3);

            this.modeld.rotation.z -= this.lerp(this.modeld.rotation.z, Math.max(-2.2, Math.min(-faceTransform.rotation.Quaternion._z * 10, 2.2)) - 2, .3);
            if (this.modeld.rotation.y <= -.05 && this.modeld.rotation.z <= -0.09) {
                //this.modeld.rotation.z *= -1+deltaY
                //this.modeld.rotation.y -= this.lerp(this.modeld.rotation.y, Math.max(-1.2, Math.min(-faceTransform.rotation.Quaternion._y * 10, 2.2)) - 2, 1)
                //this.modeld.rotation.z *= -.9
                console.log("String")
            } else {


            }
            if (this.modeld.rotation.y < -.3) {

                //modeld.rotation._x *= -.1
                this.modeld.rotation.z *= -.1
            }
            if (this.modeld.rotation.y > .3 && this.modeld.rotation.x <= -.02 && this.modeld.rotation.z <= -.02) {
                console.log("ok")
                //modeld.rotation._x *= -.1
                this.modeld.rotation.z *= -.1
            }
            if (this.modeld.rotation.z > .5) {
                //this.modeld.rotation.z = -1.7
            }
            //if (this.modeld.rotation.y <= -.35 && this.modeld.rotation.x >= .004 && this.modeld.rotation.z >= .004) {
            //    this.modeld.rotation.y *= -.1
            //    this.modeld.rotation.z *= -.1
            //}


            console.log(this.modeld.rotation.z, this.modeld.rotation.y, this.modeld.rotation.z)
            // Draw debug markers
            this.ctx.beginPath();
            this.ctx.arc(midX * this.canvas.width, midY * this.canvas.height, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.strokeStyle = "blue";
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.restore();


            this.ctx.save();
            this.ctx.strokeStyle = "lime";
            this.ctx.lineWidth = 1;


            //console.log(results)
            //if (!detections) return
            //for (const [i, p] of Object.entries(detections.faceLandmarks[0])) {
            //    this.ctx.beginPath();
            //    this.ctx.arc(
            //        p.x * this.canvas.width,
            //        p.y * this.canvas.height,
            //        1.3, 0, Math.PI * 2
            //    );
            //    this.ctx.stroke();

            //}
            //this.ctx.restore();


            //console.log(`Delta: (${deltaX.toFixed(3)}, ${deltaY.toFixed(3)}) | Offset: (${this.offsetX.toFixed(2)}, ${this.offsetY.toFixed(2)})`);

        } catch (ex) {
            console.error(ex);
        }
    }

    processResultsD = (detections) => {
        //const rigFaceBones = {
        //    JawBone: modeld.getObjectByName("DEF-jaw"),
        //    UpperLipBone: modeld.getObjectByName("DEF-lip.T"),
        //    LowerLipBone: modeld.getObjectByName("DEF-lip.B"),
        //    MouthLeftBone: modeld.getObjectByName("DEF-lip.L"),
        //    MouthRightBone: modeld.getObjectByName("DEF-lip.R"),
        //    LeftEyeBone: modeld.getObjectByName("DEF-eye.L"),
        //    RightEyeBone: modeld.getObjectByName("DEF-eye.R"),
        //    LeftBrowBone: modeld.getObjectByName("DEF-brow.T.L"),
        //    RightBrowBone: modeld.getObjectByName("DEF-brow.T.R"),
        //};

        if (!detections.faceLandmarks || !this.modeld) return;

        try {
            this.ctx.save();
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 1;

            const L = detections.faceLandmarks[0][33];  // Left eye
            const R = detections.faceLandmarks[0][263]; // Right eye
            const faceTransform = this.computeFaceTransform(detections.faceLandmarks[0]);

            // Calculate face center in normalized coordinates (0-1)
            const midX = (L.x + R.x) * 0.5;
            const midY = (L.y + R.y) * 0.5;

            // Calculate how far from center (0.5, 0.5) the face is
            const deltaX = (midX - 0.5) + this.x;  // -0.5 to +0.5 range
            const deltaY = (midY - 0.5) + this.y;  // -0.5 to +0.5 range

            // Accumulate offset to track face movement




            const moveSpeed = 0.5;
            const maxOffset = 10; // Maximum units the mask can move from center

            this.modeld.position.lerp(new THREE.Vector3(-((((midX - .45) + (midX - .45)) * 10) + 10.7)+this.oldVectorPos.x, -(((midY - .35) + (midY - .35)) * 10) + 3.12, ((faceTransform.position.z - .2000) + ((faceTransform.scale - .2)) * 10) + 4.74), 1)
            this.facecamera.position.lerp(new THREE.Vector3((((midX - .45) + (midX - .45)) * 100) + 10.7, (((midY - .5) + (midY - .5)) * 10), -(faceTransform.position.z - 4.5) * 10), 0.3);
            console.log(this.oldVectorPos.position)
            var scale = faceTransform.scale * 3.5; // Adjust multiplier as needed
            scale -= ((midY / midX) * .5) * faceTransform.scale
            //console.log(facecamera.rotation.x);
            //Center.scale.lerp(new THREE.Vector3(0.3, .3, .3), 0.3);
            this.modeld.scale.lerp(new THREE.Vector3(2, 2, .80), 0.3);



            // Draw debug markers
            this.ctx.beginPath();
            this.ctx.arc(midX * this.canvas.width, midY * this.canvas.height, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.strokeStyle = "blue";
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.restore();


            this.ctx.save();
            this.ctx.strokeStyle = "lime";
            this.ctx.lineWidth = 1;


            //console.log(results)
            //if (!detections) return
            //for (const [i, p] of Object.entries(detections.faceLandmarks[0])) {
            //    this.ctx.beginPath();
            //    this.ctx.arc(
            //        p.x * this.canvas.width,
            //        p.y * this.canvas.height,
            //        1.3, 0, Math.PI * 2
            //    );
            //    this.ctx.stroke();

            //}
            //this.ctx.restore();


            //console.log(`Delta: (${deltaX.toFixed(3)}, ${deltaY.toFixed(3)}) | Offset: (${this.offsetX.toFixed(2)}, ${this.offsetY.toFixed(2)})`);

        } catch (ex) {
            console.log(ex);
        }
    }

    //processResultst = (detections) => {
    //    if (!detections.faceLandmarks || !this.modeld) return;

    //    try {
    //        const L = detections.faceLandmarks[0][33];  // Left eye
    //        const R = detections.faceLandmarks[0][263]; // Right eye
    //        const faceTransform = this.computeFaceTransform(detections.faceLandmarks[0]);

    //        const midX = (L.x + R.x) * 0.5;
    //        const midY = (L.y + R.y) * 0.5;

    //        // Calculate how far from center (0.5, 0.5) the face is
    //        const deltaX = (midX - 0.5) + this.x;  // -0.5 to +0.5 range
    //        const deltaY = (midY - 0.5) + this.y;  // -0.5 to +0.5 range

    //        //this.modeld.position.lerp(new THREE.Vector3((midX/2+(deltaX+deltaY)/2)*10,-(midY+deltaY)*10,(faceTransform.scale- (deltaY+deltaX)/2)*10), 0.3);
    //        //this.facecamera.position.lerp(new THREE.Vector3(midX, midY, -faceTransform.scale), 0.3);

    //        if(this.modeld.position)

    //        console.log(midX, midY);
    //        this.modeld.scale.lerp(new THREE.Vector3(faceTransform.scale - (deltaY + deltaX) / 2, faceTransform.scale - (deltaY + deltaX) / 2, faceTransform.scale - (deltaY + deltaX) / 2),.3)

    //        this.ctx.save();
    //        this.ctx.strokeStyle = "red";
    //        this.ctx.lineWidth = 1;




    //        this.ctx.beginPath();
    //        this.ctx.arc(midX * this.canvas.width, midY * this.canvas.height, 3, 0, Math.PI * 2);
    //        this.ctx.stroke();

    //        this.ctx.strokeStyle = "blue";
    //        this.ctx.beginPath();
    //        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 3, 0, Math.PI * 2);
    //        this.ctx.stroke();

    //        this.ctx.restore();


    //        this.ctx.save();
    //        this.ctx.strokeStyle = "lime";
    //        this.ctx.lineWidth = 1;


    //        //console.log(results)
    //        if (!detections) return
    //        for (const [i, p] of Object.entries(detections.faceLandmarks[0])) {
    //            this.ctx.beginPath();
    //            this.ctx.arc(
    //                p.x * this.canvas.width,
    //                p.y * this.canvas.height,
    //                1.3, 0, Math.PI * 2
    //            );
    //            this.ctx.stroke();

    //        }
    //        this.ctx.restore();


    //    } catch (ex) {
    //        console.log(ex)
    //    }
    //}



    //processResults = (detections) => {
    //    if (!detections.faceLandmarks || !this.modeld || !this.Center) return;

    //    try {
    //        this.ctx.save();
    //        this.ctx.strokeStyle = "red";
    //        this.ctx.lineWidth = 1;

    //        const L = detections.faceLandmarks[0][33];  // Left eye
    //        const R = detections.faceLandmarks[0][263]; // Right eye
    //        const faceTransform = this.computeFaceTransform(detections.faceLandmarks[0]);

    //        // Calculate face center in normalized coordinates (0-1)
    //        const midX = (L.x + R.x) * 0.5;
    //        const midY = (L.y + R.y) * 0.5;

    //        // === TRACK CENTER SPHERE TO EYE MIDPOINT ===
    //        // Convert normalized coordinates to world space
    //        const anchorX = (midX - 0.5) * 20;  // Adjust multiplier for your scene scale
    //        const anchorY = -(midY - 0.5) * 20; // Negative because CSS is flipped
    //        const anchorZ = -faceTransform.scale * 10; // Depth based on face size

    //        // Smooth anchor sphere movement
    //        this.Center.position.lerp(
    //            new THREE.Vector3(anchorX, anchorY, anchorZ),
    //            0.3
    //        );

    //        // === ANCHOR SPHERE ROTATION ===
    //        const eu = new THREE.Euler().setFromQuaternion(faceTransform.rotation.Quaternion, 'XYZ');

    //        this.Center.rotation.x = this.lerp(this.Center.rotation.x, -eu.x, 0.3);
    //        this.Center.rotation.y = this.lerp(this.Center.rotation.y, eu.y, 0.3);
    //        this.Center.rotation.z = this.lerp(this.Center.rotation.z, -eu.z, 0.3);

    //        // === ANCHOR SPHERE SCALE ===
    //        const sphereScale = faceTransform.scale * 15; // Adjust multiplier for sphere size
    //        this.Center.scale.lerp(
    //            new THREE.Vector3(sphereScale, sphereScale, sphereScale),
    //            0.3
    //        );
    //        const maskPiece = this.modeld.getObjectByName("YourMaskPartName");
    //        if (maskPiece) {
    //            maskPiece.position.set(0, 0.5, 0); // Adjust these values to align with Center
    //        }
    //        // === POSITION FULL MODEL (parent) ===
    //        // The modeld (parent) should follow the Center sphere
    //        // Or if you want independent control, you can position it separately
    //        this.modeld.position.lerp(
    //            new THREE.Vector3(anchorX, anchorY, anchorZ),
    //            0.3
    //        );

    //        // === MODEL ROTATION ===
    //        this.modeld.rotation.x = this.lerp(this.modeld.rotation.x, -eu.x, 0.3);
    //        this.modeld.rotation.y = this.lerp(this.modeld.rotation.y, eu.y, 0.3);
    //        this.modeld.rotation.z = this.lerp(this.modeld.rotation.z, -eu.z, 0.3);

    //        // === MODEL SCALE ===
    //        const modelScale = faceTransform.scale * 12; // Adjust for your model
    //        this.modeld.scale.lerp(
    //            new THREE.Vector3(modelScale, modelScale, modelScale * 0.8),
    //            0.3
    //        );

    //        // === CAMERA TRACKING (optional) ===
    //        // Make camera follow face slightly for better perspective
    //        this.facecamera.position.lerp(
    //            new THREE.Vector3(
    //                -anchorX * 0.3,
    //                anchorY * 0.3,
    //                20 - faceTransform.scale * 5
    //            ),
    //            0.2
    //        );

    //        // === DEBUG VISUALIZATION ===
    //        this.ctx.beginPath();
    //        this.ctx.arc(midX * this.canvas.width, midY * this.canvas.height, 3, 0, Math.PI * 2);
    //        this.ctx.stroke();

    //        this.ctx.strokeStyle = "blue";
    //        this.ctx.beginPath();
    //        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 3, 0, Math.PI * 2);
    //        this.ctx.stroke();

    //        this.ctx.restore();

    //        // Draw all landmarks
    //        this.ctx.save();
    //        this.ctx.strokeStyle = "lime";
    //        this.ctx.lineWidth = 1;

    //        if (!detections) return;
    //        for (const [i, p] of Object.entries(detections.faceLandmarks[0])) {
    //            this.ctx.beginPath();
    //            this.ctx.arc(
    //                p.x * this.canvas.width,
    //                p.y * this.canvas.height,
    //                1.3, 0, Math.PI * 2
    //            );
    //            this.ctx.stroke();
    //        }
    //        this.ctx.restore();

    //    } catch (ex) {
    //        console.error(ex);
    //    }
    //}


    staged() {
        /* ---------------- CAMERA ---------------- */
        //this.camera = new Camera(video, {
        //    onFrame: async () => {
        //        await segmentation.send({ image: video });
        //        //const landmarks = faceLandmarker.detect(video);
        //        //await faceMesh.send({ image: video });
        //        const faceLandmarkerResult = faceLandmarker.detectForVideo(video, Date.now());
        //        this.processResults(faceLandmarkerResult);
        //    },
        //    width: 1280,
        //    height: 720
        //});

        //this.camera.start();

        if (WebGL.isWebGL2Available()) {

            this.animate();

        } else {
            console.warn(WebGL.getWebGLErrorMessage());
        }
    }


}