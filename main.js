import { SuperpoweredGlue, SuperpoweredWebAudio } from './superpowered/SuperpoweredWebAudio.js';

var webaudioManager = null; // The SuperpoweredWebAudio helper class managing Web Audio for us.
var Superpowered = null; // Reference to the Superpowered module.
var audioNode = null;    // This example uses one audio node only.
var content = null;      // The <div> displaying everything.

// click on play/pause
function togglePlayback(e) {
    let button = document.getElementById('playPause');
    if (button.value == 1) {
        button.value = 0;
        button.innerText = 'START PLAYBACK';
        webaudioManager.audioContext.suspend();
    } else {
        button.value = 1;
        button.innerText = 'PAUSE';
        webaudioManager.audioContext.resume();
    }
}

function startUserInterface() {
    // UI: innerHTML may be ugly but keeps this example relatively small
    content.innerHTML = '\
        <h3>Play/pause:</h3>\
        <button id="playPause" value="0">START PLAYBACK</button>\
    ';

    document.getElementById('playPause').addEventListener('click', togglePlayback);

}

function onMessageFromAudioScope(message) {
    if (message.loaded) startUserInterface();
    else console.log('Message received from the audio node: ' + message);
}

// when the START WITH GUITAR SAMPLE button is clicked
async function startSample() {
    content.innerText = 'Creating the audio context and node...';
    webaudioManager = new SuperpoweredWebAudio(44100, Superpowered);
    let currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    audioNode = await webaudioManager.createAudioNodeAsync(currentPath + '/processor.js', 'MyProcessor', onMessageFromAudioScope);

    // audioNode -> audioContext.destination (audio output)
    webaudioManager.audioContext.suspend();
    audioNode.connect(webaudioManager.audioContext.destination);
    webaudioManager.audioContext.suspend();

    content.innerText = 'Downloading and decoding music...';
}

async function loadJS() {
    // download and instantiate Superpowered
    Superpowered = await SuperpoweredGlue.fetch('./superpowered/superpowered.wasm');
    Superpowered.Initialize('ExampleLicenseKey-WillExpire-OnNextUpdate');

    // display the initial UI
    content = document.getElementById('content');
    content.innerHTML = '<p>Start here: <button id="startSample">LOAD SAMPLES</button></p>';
    document.getElementById('startSample').addEventListener('click', startSample);
}

loadJS();
