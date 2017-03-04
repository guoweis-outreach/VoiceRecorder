import Html5Recorder from './Html5Recorder';
import FlashRecorder from './FlashRecorder';



class AudioRecorder {

  constructor(updateCallback) {
    this._updateCallback = updateCallback;
    this._isRecording = false;
    this._recordingStartTime = undefined;
    this._recordingEndTime = undefined;
    this._timerId = undefined;
    this._recorder = undefined;
  }


  start() {
    // start recording
    this._recorder.start(() => {
      this._recordingStartTime = new Date().getTime();
      this._recordingEndTime = undefined;

      // trigger updates
      this._updateCallback();
      this._timerId = setInterval(() => {
        this._updateCallback();
      }, 1000);
    });
    this._isRecording = true;
    this._updateCallback();
  }

  stop() {
    this._isRecording = false;
    this._recordingEndTime = new Date().getTime();
    this._recorder.stop();
    this._updateCallback();
    clearInterval(this._timerId);
    this._timerId = undefined;
  }

  get isRecording() {
    return this._isRecording;
  }

  get recordedBlob() {
    if (!this._recorder) return undefined;
    return this._recorder.recordedBlob;
  }

  get recordingTime() {
    if (this._recordingEndTime) return this._recordingEndTime - this._recordingStartTime;
    return new Date().getTime() - this._recordingStartTime;
  }


  initAudio() {
    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
      navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
      navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    const blobCallback = () => this._updateCallback();

    if (navigator.getUserMedia) {
      this._recorder = new Html5Recorder(blobCallback);
      return true;
    } else {
      if (!swfobject.hasFlashPlayerVersion("11")) {
        console.log(swfobject.getFlashPlayerVersion());
        // no flash installed or outdated
        return false;
      }
      this._recorder = new FlashRecorder(blobCallback);
      return true;
    }
  }

}

export default AudioRecorder;
