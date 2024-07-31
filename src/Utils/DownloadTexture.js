const download = document.getElementById('export');
function init(drawingCanvas){ 
    download.addEventListener('click', (event) => {
        openCanvasInNewTab(drawingCanvas)
    });
}
function openCanvasInNewTab(drawingCanvas) {
  const dataURL = drawingCanvas.toDataURL("image/png");
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([arrayBuffer], { type: mimeString });
  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL, '_blank');
}

export default init;