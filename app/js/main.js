import $ from 'jquery';
import FileSaver from 'file-saver';
import AudioRecorder from './AudioRecorder';

$(document).ready(() => {
  console.log('Init');

  const audioRecorder = new AudioRecorder(() => {
    // update recording time
    $('#recording-running').text(`Is recording: ${audioRecorder.isRecording}`);

    const recordedSeconds = audioRecorder.recordingTime / 1000;
    let hours = Math.floor(recordedSeconds / 3600);
    let minutes = Math.floor((recordedSeconds - (hours * 3600)) / 60);
    let seconds = Math.floor(recordedSeconds - (hours * 3600) - (minutes * 60));

    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    const time = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
    $('#recording-time').text(time);

    // update recording preview
    if (audioRecorder.recordedBlob) {
      const url = (window.URL || window.webkitURL).createObjectURL(audioRecorder.recordedBlob);
      const audio = $('audio');
      audio[0].pause();
      audio[0].load();
      $('source').attr('src', url).detach().appendTo('audio');
    }
  });

  audioRecorder.initAudio();

  // setup start / stop
  $('#recording-start').click(() => {
    if (!audioRecorder.isRecording) {
      audioRecorder.start();
      return;
    }
    audioRecorder.stop();
  });

  // setup save
  $('#recording-save').click(() => {
    if (!audioRecorder.recordedBlob) return;
    const now = new Date();
    let month = now.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day = now.getDate() + 1;
    if (day < 10) day = `0${day}`;

    FileSaver.saveAs(
      audioRecorder.recordedBlob,
      `recording-${now.getFullYear()}-${month}-${day}-${now.getSeconds() + (60 * now.getMinutes() + (60 * now.getHours()))}`
    );
  });
});
