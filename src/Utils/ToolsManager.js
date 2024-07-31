export let toolState="pen";
function init(reset){
    const resetBtn = document.getElementById('reset');
    resetBtn.addEventListener('click', (event) => {
        reset();
    });
    const penButton = document.getElementById('pen');
    const circlePenButton = document.getElementById('circlePen');
    penButton.addEventListener('click', (event) => {
        toolState="pen";
        penButton.className="selected";
        circlePenButton.className="";
    });
    circlePenButton.addEventListener('click', (event) => {
    toolState="circle";
    circlePenButton.className="selected";
    penButton.className="";
});
}
export default init;