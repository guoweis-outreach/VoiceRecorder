import MediaStreamRecorder from 'msr';


class AudioRecorder {

  start() {
    const onMediaSuccess = stream => {
      console.log('success');
      this._mediaRecorder = new MediaStreamRecorder(stream);
      this._mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
      this._mediaRecorder.ondataavailable = function () {
        console.log('data available');
      };
      this._mediaRecorder.start(3000);
    };

    const onMediaError = error => {
      console.log('media error', error);
    };

    navigator.getUserMedia({ audio: true }, onMediaSuccess, onMediaError);

  }

  stop() {
    this._mediaRecorder.stop();
  }

  save() {
    this._mediaRecorder.save();
  }

}

export default AudioRecorder;
