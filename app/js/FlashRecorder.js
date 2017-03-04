import $ from 'jquery';
import FWRecorder from './libs/flashRecorder';

const KEY_RECORDING = 'audio';

class FlashRecorder {

  constructor(recordedBlobSavedCallback) {
    console.log('Using flash recorder');
    this._recordedBlobSavedCallback = recordedBlobSavedCallback;

    const elemStartRecording = $('#recording-start').prop('disabled', true);

    const RECORDER_APP_ID = 'recorderApp';

    const appWidth = 24;
    const appHeight = 24;
    const flashvars = {};
    const params = {};
    const attributes = { id: RECORDER_APP_ID, name: RECORDER_APP_ID };
    swfobject.embedSWF('/flashRecorder.swf', 'flashcontent', appWidth, appHeight, '11.0.0', '', flashvars, params, attributes);

    window.fwr_event_handler = function fwr_event_handler() {
      let name;
      console.log(arguments[0]);
      switch (arguments[0]) {
        case 'ready':
          elemStartRecording.prop('disabled', false);
          $('#recorderApp').css({
            height: 0,
          });

          FWRecorder.uploadFormId = "#uploadForm";
          FWRecorder.uploadFieldName = "upload_file[filename]";
          FWRecorder.connect(RECORDER_APP_ID, 0);
          FWRecorder.recorderOriginalWidth = appWidth;
          FWRecorder.recorderOriginalHeight = appHeight;

          break;

        case 'microphone_user_request':
          FWRecorder.showPermissionWindow();
          break;

        case 'permission_panel_closed':
          FWRecorder.defaultSize();
          break;

        case 'recording':
          FWRecorder.hide();
          FWRecorder.observeLevel();
          break;

        case 'recording_stopped':
          FWRecorder.show();
          FWRecorder.stopObservingLevel();
          break;

        case 'save_pressed':
          FWRecorder.updateForm();
          break;

        case 'saving':
          name = arguments[1];
          console.info('saving started', name);
          break;

        case 'saved':
          name = arguments[1];
          const response = arguments[2];
          console.info('saving success', name, response);
          break;

        case 'save_failed':
          name = arguments[1];
          const errorMessage = arguments[2];
          console.info('saving failed', name, errorMessage);
          break;

        case 'save_progress':
          name = arguments[1];
          const bytesLoaded = arguments[2];
          const bytesTotal = arguments[3];
          console.info('saving progress', name, bytesLoaded, '/', bytesTotal);
          break;
      }
    };
  }

  start() {
    FWRecorder.record(KEY_RECORDING, 'audio.wav');
  }

  stop() {
    FWRecorder.stopRecording(KEY_RECORDING);
    this._recordedBlobSavedCallback();
  }

  get recordedBlob() {
    return FWRecorder.getBlob(KEY_RECORDING);
  }
}

export default FlashRecorder;