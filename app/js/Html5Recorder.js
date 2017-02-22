import Recorder from './libs/recorder';

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class Html5Recorder {

  constructor(recordedBlobSavedCallback) {
    console.log('Using Html5 recorder');
    this._audioContext = new AudioContext();
    this._audioInput = undefined;
    this._realAudioInput = undefined;
    this._inputPoint = undefined;
    this._recorder = undefined;
    this._rafID = undefined;

    this._recordedBlob = undefined;
    this._recordedBlobSavedCallback = recordedBlobSavedCallback;

    navigator.getUserMedia(
      {
        "audio": {
          "mandatory": {
            "googEchoCancellation": "false",
            "googAutoGainControl": "false",
            "googNoiseSuppression": "false",
            "googHighpassFilter": "false"
          },
          "optional": []
        },
      }, this._gotStream.bind(this), e => {
        console.error(e);
      });

  }

  start() {
    this._recorder.clear();
    this._recordedBlob = undefined;
    this._recorder.record();
  }

  stop() {
    this._recorder.stop();
    this._recorder.exportWAV(blob => {
      this._recordedBlob = blob;
      this._recordedBlobSavedCallback();
    });
  }

  get recordedBlob() {
    return this._recordedBlob;
  }

  _convertToMono(input) {
    const splitter = this._audioContext.createChannelSplitter(2);
    const merger = this._audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
  }

  _cancelAnalyserUpdates() {
    window.cancelAnimationFrame(this._rafID);
    this._rafID = null;
  }

  _toggleMono() {
    if (this._audioInput != this._realAudioInput) {
      this._audioInput.disconnect();
      this._realAudioInput.disconnect();
      this._audioInput = this._realAudioInput;
    } else {
      this._realAudioInput.disconnect();
      this._audioInput = this._convertToMono(this._realAudioInput);
    }

    this._audioInput.connect(this._inputPoint);
  }

  _gotStream(stream) {
    this._inputPoint = this._audioContext.createGain();

    // Create an AudioNode from the stream.
    this._realAudioInput = this._audioContext.createMediaStreamSource(stream);
    this._audioInput = this._realAudioInput;
    this._audioInput.connect(this._inputPoint);

    // audioInput = convertToMono( input );

    const analyserNode = this._audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    this._inputPoint.connect(analyserNode);

    this._recorder = new Recorder(this._inputPoint);

    const zeroGain = this._audioContext.createGain();
    zeroGain.gain.value = 0.0;
    this._inputPoint.connect(zeroGain);
    zeroGain.connect(this._audioContext.destination);
    // updateAnalysers();
  }

}

export default Html5Recorder;