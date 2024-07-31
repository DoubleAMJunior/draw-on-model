
export let penColor="#ff0000";
function init(){
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (event) => {
    penColor= event.target.value;
    });
}
export default init;