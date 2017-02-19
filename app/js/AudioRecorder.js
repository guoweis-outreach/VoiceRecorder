import Recorder from './libs/recorder';

window.AudioContext = window.AudioContext || window.webkitAudioContext;



class AudioRecorder {

  constructor(updateCallback) {
    this._updateCallback = updateCallback;
    this._isRecording = false;
    this._recordedBlob = undefined;
    this._recordingStartTime = undefined;
    this._recordingEndTime = undefined;

    this._timerId = undefined;

    this._audioContext = new AudioContext();
    this._audioInput = undefined;
    this._realAudioInput = undefined;
    this._inputPoint = undefined;
    this._recorder = undefined;
    this._rafID = undefined;
  }



  start() {
    if (!this._recorder) return;

    // reset
    this._recorder.clear();
    this._recordedBlob = undefined;

    // start recording
    this._recorder.record();
    this._isRecording = true;
    this._recordingStartTime = new Date().getTime();
    this._recordingEndTime = undefined;

    // trigger updates
    this._updateCallback();
    this._timerId = setInterval(() => {
      this._updateCallback();
    }, 1000);
  }

  stop() {
    this._isRecording = false;
    this._recordingEndTime = new Date().getTime();
    this._recorder.stop();
    this._recorder.exportWAV(blob => {
      this._recordedBlob = blob;
      this._updateCallback();
    });
    this._updateCallback();
    clearInterval(this._timerId);
    this._timerId = undefined;
  }

  get isRecording() {
    return this._isRecording;
  }

  get recordedBlob() {
    return this._recordedBlob;
  }

  get recordingTime() {
    if (this._recordingEndTime) return this._recordingEndTime - this._recordingStartTime;
    return new Date().getTime() - this._recordingStartTime;
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

  /*
  _updateAnalysers(time) {
    return;
    if (!analyserContext) {
      var canvas = document.getElementById("analyser");
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
      var SPACING = 3;
      var BAR_WIDTH = 1;
      var numBars = Math.round(canvasWidth / SPACING);
      var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

      analyserNode.getByteFrequencyData(freqByteData);

      analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
      analyserContext.fillStyle = '#F6D565';
      analyserContext.lineCap = 'round';
      var multiplier = analyserNode.frequencyBinCount / numBars;

      // Draw rectangle for each frequency bin.
      for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++)
          magnitude += freqByteData[offset + j];
        magnitude = magnitude / multiplier;
        var magnitude2 = freqByteData[i * multiplier];
        analyserContext.fillStyle = "hsl( " + Math.round((i * 360) / numBars) + ", 100%, 50%)";
        analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
      }
    }

    rafID = window.requestAnimationFrame(updateAnalysers);
  }
  */

  _toggleMono() {
    if (this._audioInput != this._realAudioInput) {
      this._audioInput.disconnect();
      this._realAudioInput.disconnect();
      this._audioInput = this._realAudioInput;
    } else {
      this._realAudioInput.disconnect();
      this._audioInput = convertToMono(this._realAudioInput);
    }

    this._audioInput.connect(this._inputPoint);
  }

  _gotStream(stream) {
    this._inputPoint = this._audioContext.createGain();

    // Create an AudioNode from the stream.
    this._realAudioInput = this._audioContext.createMediaStreamSource(stream);
    this._audioInput = this._realAudioInput;
    this._audioInput.connect(this._inputPoint);

//    audioInput = convertToMono( input );

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

  initAudio() {
    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
      navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
      navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

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

}

export default AudioRecorder;
