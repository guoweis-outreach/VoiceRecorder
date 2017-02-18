import $ from 'jquery';
import AudioRecorder from './AudioRecorder';

$(document).ready(() => {
  console.log('Init');

  const recorder = new AudioRecorder();

  $('#recording-start').click(() => {
    recorder.start();
  });
  $('#recording-stop').click(() => {
    recorder.stop();
  });
  $('#recording-save').click(() => {
    recorder.save();
  });
});
