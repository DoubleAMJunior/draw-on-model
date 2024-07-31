import MainScene from "./Scenes/MainScene";
import colorPickerInit from './Utils/ColorPicker'
import toolsManagerInit from './Utils/ToolsManager'
import downloadManagerInit from './Utils/DownloadTexture'
const mainScene=new MainScene();
colorPickerInit();
toolsManagerInit(()=>{mainScene.reset()})
downloadManagerInit(mainScene.drawingCanvas)
mainScene.animate();
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  mainScene.camera.aspect = window.innerWidth / window.innerHeight;
  mainScene.camera.updateProjectionMatrix();
  mainScene.renderer.setSize(window.innerWidth, window.innerHeight);
}
function onMouseDown(event) {
    mainScene.onMouseDown(event)
  }
  
  let lastIntersection=undefined;
  function onMouseMove(event) {
    mainScene.onMouseMove(event)
  }
  
  function onMouseUp() {
    mainScene.onMouseUp()
  }
