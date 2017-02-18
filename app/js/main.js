import $ from 'jquery';
import MediaStreamRecorder from 'msr';

let mediaRecorder = undefined;

function onMediaSuccess(stream) {
  console.log('success');
  mediaRecorder = new MediaStreamRecorder(stream);
  mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
  mediaRecorder.ondataavailable = function () {
    console.log('data available');
  };
  mediaRecorder.start(3000);
}

function onMediaError(e) {
  console.log('media error', e);
}


$(document).ready(() => {
  console.log('Init');

  $('#recording-start').click(() => {
    navigator.getUserMedia({ audio: true }, onMediaSuccess, onMediaError);
  });
  $('#recording-stop').click(() => {
    mediaRecorder.stop();
  });
  $('#recording-save').click(() => {
    mediaRecorder.save();
  });
});
