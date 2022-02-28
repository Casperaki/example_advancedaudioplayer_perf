import { SuperpoweredWebAudio, SuperpoweredTrackLoader } from './superpowered/SuperpoweredWebAudio.js';

const playersCount = 20;

class MyProcessor extends SuperpoweredWebAudio.AudioWorkletProcessor {
    // runs after the constructor
    onReady() {
        this.players = [];

        for (let i = 0; i < playersCount; i++) {
            this.players.push(new this.Superpowered.AdvancedAudioPlayer(this.samplerate, 2, 2, 0, 0.501, 2, false));
        }
        SuperpoweredTrackLoader.downloadAndDecode('../A2.mp3', this);
        SuperpoweredTrackLoader.downloadAndDecode('../gong_1.mp3', this);
    }

    onDestruct() {
        this.player.destruct();
    }

    onMessageFromMainScope(message) {
        if (message.SuperpoweredLoaded) {
            if (message.SuperpoweredLoaded.url.includes("A2")) {
                for (let i = 0; i < this.players.length/2; i++) {
                    const player = this.players[i];
                    player.openMemory(this.Superpowered.arrayBufferToWASM(message.SuperpoweredLoaded.buffer), false, false);
                    player.loopOnEOF = true;
                    player.playSynchronizedToPosition(i * -100);
                    // player.play();
                }
            } else {
                for (let i = Math.ceil(this.players.length/2); i < this.players.length; i++) {
                    const player = this.players[i];
                    player.openMemory(this.Superpowered.arrayBufferToWASM(message.SuperpoweredLoaded.buffer), false, false);
                    player.loopOnEOF = true;
                    player.playSynchronizedToPosition(i * -100);
                }
                this.sendMessageToMainScope({ loaded: true });
            }
        }
    }

    processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
        // if (!this.player.processStereo(outputBuffer.pointer, false, buffersize, 1)) this.Superpowered.memorySet(outputBuffer.pointer, 0, buffersize * 8);
        // this.distortion.process(outputBuffer.pointer, outputBuffer.pointer, buffersize);

        let playing = false;

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].processStereo(outputBuffer.pointer, playing, buffersize, 1)) playing = true;
        }
        if (!playing) {
            this.Superpowered.memorySet(outputBuffer.pointer, 0, buffersize * 8);
        }
    }
}

if (typeof AudioWorkletProcessor === 'function') registerProcessor('MyProcessor', MyProcessor);
export default MyProcessor;
