import { SuperpoweredWebAudio, SuperpoweredTrackLoader } from './superpowered/SuperpoweredWebAudio.js';

const sampleUrls = [
    "https://tonejs.github.io/audio/salamander/A1.mp3",
    "https://tonejs.github.io/audio/salamander/C1.mp3",
    "https://tonejs.github.io/audio/salamander/Ds1.mp3",
    "https://tonejs.github.io/audio/salamander/Fs1.mp3",
    "https://tonejs.github.io/audio/salamander/A2.mp3",
    "https://tonejs.github.io/audio/salamander/C2.mp3",
    "https://tonejs.github.io/audio/salamander/Ds2.mp3",
    "https://tonejs.github.io/audio/salamander/Fs2.mp3",
    "https://tonejs.github.io/audio/salamander/A3.mp3",
    "https://tonejs.github.io/audio/salamander/C3.mp3",
    "https://tonejs.github.io/audio/salamander/Ds3.mp3",
    "https://tonejs.github.io/audio/salamander/Fs3.mp3",
    "https://tonejs.github.io/audio/salamander/A4.mp3",
    "https://tonejs.github.io/audio/salamander/C4.mp3",
    "https://tonejs.github.io/audio/salamander/Ds4.mp3",
    "https://tonejs.github.io/audio/salamander/Fs4.mp3",
    "https://tonejs.github.io/audio/salamander/A5.mp3",
    "https://tonejs.github.io/audio/salamander/C5.mp3",
    "https://tonejs.github.io/audio/salamander/Ds5.mp3",
    "https://tonejs.github.io/audio/salamander/Fs5.mp3",
];

class MyProcessor extends SuperpoweredWebAudio.AudioWorkletProcessor {
    // runs after the constructor
    onReady() {
        this.players = {};

        for (let i = 0; i < sampleUrls.length; i++) {
            this.players[sampleUrls[i]] = new this.Superpowered.AdvancedAudioPlayer(this.samplerate, 2, 2, 0, 0.501, 2, false);
        }
        sampleUrls.forEach((url) =>  SuperpoweredTrackLoader.downloadAndDecode(url, this) );
    }

    onDestruct() {
        // this.player.destruct();
    }

    onMessageFromMainScope(message) {
        if (message.SuperpoweredLoaded) {
            const url = message.SuperpoweredLoaded.url
            const player = this.players[url];
            player.openMemory(this.Superpowered.arrayBufferToWASM(message.SuperpoweredLoaded.buffer), false, false);
            player.loopOnEOF = true;
            player.playSynchronizedToPosition(sampleUrls.indexOf(url) * -100);
            player._loaded = true;
            
            if (Object.values(this.players).every(p => p._loaded))
                this.sendMessageToMainScope({ loaded: true });
        }
    }

    processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
        // if (!this.player.processStereo(outputBuffer.pointer, false, buffersize, 1)) this.Superpowered.memorySet(outputBuffer.pointer, 0, buffersize * 8);
        // this.distortion.process(outputBuffer.pointer, outputBuffer.pointer, buffersize);

        let playing = false;

        Object.values(this.players).forEach( player => {
            if (player.processStereo(outputBuffer.pointer, playing, buffersize, 1)) playing = true;
        } );

        if (!playing) {
            this.Superpowered.memorySet(outputBuffer.pointer, 0, buffersize * 8);
        }
    }
}

if (typeof AudioWorkletProcessor === 'function') registerProcessor('MyProcessor', MyProcessor);
export default MyProcessor;
