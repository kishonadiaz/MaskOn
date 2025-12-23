# MaskOn

MaskOn overlays a 3D mask onto a live camera feed and follows the user’s face in real time.  
It uses MediaPipe face landmarks & segmentation for tracking and Three.js for rendering. Designed to run inside a WebView hosted by a __.NET 8__ WPF app.
That allow you to have a mask on your face while straming or recording videos
It is simular to Snap Camera and vTuber 

## Key features
- Real-time face landmark detection using MediaPipe Face Landmarker (WASM / GPU delegate).  
- Person segmentation to composite the camera feed with a 3D mask model.  
- Three.js scene with FBX/GLTF mask models, skeletal mapping and smooth pose/scale interpolation.  
- Drag/position controls integrated with the .NET host for window movement.  
- Tunable smoothing (lerp) and scale parameters to adapt responsiveness.

## Prerequisites
- Windows with a GPU supporting WebGL2.  
- __Visual Studio 2026__ with the __.NET 8__ SDK installed.  
- Camera permissions enabled. The web UI loads MediaPipe packages via CDN by default; bundle WASM/models locally for offline use.

## Quick start
1. Open `MaskOn.sln` in __Visual Studio 2026__.  
2. Ensure the WPF project is set as the __Startup Project__ and target framework is __.NET 8__.  
3. Build and run the app (__Debug > Start Debugging__ or Run). The WPF host loads `MaskOn/index.html` in a WebView.  
4. Grant camera access when prompted. The mask model from `MaskOn/assets/` will load and begin tracking.

## Project structure (important files)
- `MaskOn/index.html` — web UI entry point.  
- `MaskOn/js/main.js` — core logic: Three.js scene, MediaPipe integration, landmark processing, mask updates.  
- `MaskOn/css/main.css` — UI styles.  
- `MaskOn/assets/` — 3D models (FBX/GLTF), textures and supporting assets.  
- `MaskOn/MainWindow.xaml` & `MaskOn/MainWindow.xaml.cs` — WPF host and WebView glue.

## How it works (high level)
- Camera frames are processed by MediaPipe for segmentation and face landmark detection.  
- `computeFaceTransform`, `faceRotation`, `faceScale`, `Movemask` in `js/main.js` compute position, rotation and scale from landmarks.  
- Loaded mask model is positioned and animated using Three.js; smoothing (lerp) reduces jitter.

## Development notes & tips
- MediaPipe is loaded from CDNs. For reproducible builds bundle WASM and model files locally and update `FilesetResolver` usage in `js/main.js`.  
- Tune smoothing/lerp and scale multipliers in `js/main.js` to match different cameras. Search for `lerp()` and scale multipliers.  
- Keep bone names aligned between your model and the mapping constants (`FACE_BONE_MAP`, `FACE_CONNECTIONS`) or update those mappings when swapping models.  
- Use browser DevTools attached to the WebView to inspect console logs and the Three.js scene.

## Troubleshooting
- Model fails to load: verify asset paths in `MaskOn/assets/` and watch the console for loader errors.  
- Jittery tracking: increase smoothing factors, lower detection frequency or add extra averaging.  
- WebGL2 not supported: update GPU drivers; no automatic fallback implemented.

## Contributing
- Fork the repo, create a feature branch, open a PR with a clear description and screenshots or recordings for UI/behavior changes. Follow any project-specific coding rules added to `CONTRIBUTING.md`.

## License
Add your chosen license file (e.g., `LICENSE` with MIT) to the repository.