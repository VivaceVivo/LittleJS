// TODO
//
// The way the drop down is registered & used has never been tested
// (I have just one MIDI device)

// ################################################################
//
// A small sound thingy to have more fun. The MIDI stuff is below.
// (This is not how to do audio, btw., to simple :-)
//
// ################################################################

// var audioContext = new window.AudioContext;
// var gain = audioContext.createGain();
// var filter = audioContext.createBiquadFilter();
// filter.connect(gain);
// gain.connect(audioContext.destination);
// var oscillators = [];

function start(i){
  // if(oscillators[i]){
  //   oscillators[i].stop(0);
  // }
  // oscillators[i] = audioContext.createOscillator();
  // oscillators[i].type.value = "square";	
  // oscillators[i].frequency.value = 440.0 * Math.pow(2,(i-69)/12);		
  // oscillators[i].connect(filter);	
  // oscillators[i].start(0);
  for(gain of midiGains){
    if(gain.g){
      gain.g.value = 1;
    }
  }
}		

function stop(n){
  // oscillators[n].stop(0);
  // oscillators[n] = null;
  for(gain of midiGains){
    if(gain.g){
      gain.g.value = 0;
    }
  }
}
		
function volume(x) {
  if(gain){
    gain.gain.value = x;
  }
}

// END of small sound thingy.
//
// ###################################################################




// ###################################################################
//
// ------  MIDI -----------------------------------------------------
//
// ###################################################################

  
// API
//
// These are the function that need to be implemented to do anything.
// PART A - Playing

function noteOn(n,v){
  if(midiManagement){
    midiManagement.start(n);
  }
  start(n);
  console.log("On : " + n);
}

function noteOff(n){
  if(midiManagement){
    midiManagement.stop(n);
  }
  stop(n);
  console.log("Off: " + n);
}

function pitchWheel(x){
  console.log("Pitchwheel");
}

function controlle(n, v){
  console.log("Control");
}

function aftertouch(n,v){
  console.log("Aftertouch");
}

// PART B Management

// What to do if this browser doesn't know MIDI.
function noMidi(){
  // document.getElementById("colorSpan").style.background = "rgb(0, 0, 120)";
  console.log("No MIDI in this browser.");
}

// What to do if initializing MIDI failed.
function midiError(err){
  // document.getElementById("colorSpan").style.background = "rgb(120, 0, 0)";
  console.log("Error while initialising MIDI (" + err.code +")");
}

// How to shouw that MIDI works, or at least seems to.
function midiSuccess(){
  console.log("midi enabled!");
  // document.getElementById("colorSpan").style.background = "rgb(0, 120, 0)";
}

function announceMidiSources(list) {
  // Here we have a drop down.
  // midiInputDropdown = document.getElementById("midiInputDropdown");
  // Start with a clean slate.
  // midiInputDropdown.options.length = 0;
  if (midiSource && midiSource.state=="disconnected")
    midiSource=null;
  var firstInput = null;

  var inputs=midi.inputs.values();
  for ( var input = inputs.next(); input && !input.done; input = inputs.next()){
    input = input.value;
    if (!firstInput)
      firstInput=input;
    var str=input.name.toString();
    var preferred = !midiSource && ((str.indexOf("MPK") != -1)||(str.indexOf("Keyboard") != -1)||(str.indexOf("keyboard") != -1)||(str.indexOf("KEYBOARD") != -1));

    // if we're rebuilding the list, but we already had this port open, reselect it.
    if (midiSource && midiSource==input)
      preferred = true;

    // midiInputDropdown.appendChild(new Option(input.name,input.id,preferred,preferred));
    if (preferred) {
      midiSource = input;
      midiSource.onmidimessage = handleMidiMessage;
    }
  }
  if (!midiSource) {
      midiSource = firstInput;
      if (midiSource)
        midiSource.onmidimessage = handleMidiMessage;
  }
  console.log("midi selected:"+midiSource);

}

// function reqisterSelector(selectorFunction){
//   midiInputDropdown = document.getElementById("midiInputDropdown");
//   midiInputDropdown.onchange = function(ev) {
//     var id = ev.target[ev.target.selectedIndex].value;
//     selectorFunction(id);
//   }
// }

// END OF API

// #############################################################
//
// INNARDS OF MIDI INPUT
//
// #############################################################  

var midi;       // The MIDI engine.
var midiSource; // The current source

// Check whether MIDI is spoken & then ask for access,
// relegates the rest to the two callbacks, startMidi and midiError 
function initialiseMidi(){
  if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(startMidi, midiError);
  } else {
    noMidi();
  }
}

function startMidi(m){
  midi = m;
  // Register a listener for new or removed MIDIsources.
  midi.onstatechange = midiConnectionStateChange;
  // API call that MIDI is here.
  midiSuccess();
  // Now we have to look for existing MIDI sources.



  announceMidiSources();
  // reqisterSelector(selectMidiIn);
}

// NOTE: We currently ignore the channel.
function handleMidiMessage(ev) {
  var status = ev.data[0] >> 4;
  var channel = ev.data[0] & 0xf;
  var note = ev.data[1];
  var velocity = ev.data[2];
  // console.log("midi message" + ev);
  if (status == 8 || ((status == 9) && (velocity == 0))) {
    // note on with velocity 0 is sometimes used as note off
    // note off
    noteOff(note);
  } else if (status == 9) {
    // note on
    noteOn(note, velocity/127.0);
  } else if (status == 11) {
    controller(note, velocity/127.0);
  } else if (status == 14) {
    // pitch wheel
    pitchWheel(((velocity * 128.0 + note)-8192)/8192.0);
  } else if(status == 10) {
    // polyphonic aftertouch
    aftertouch(noteNumber,velocity/127)
  } else if (ev.data[0] == 254) {
    // Heartbeat. Currently ignored.
  } else {
    console.log("MIDI MSG: " + ev.data[0] + " " + ev.data[1] + " " + ev.data[2]);
  }
}

function selectMidiIn(id){
  // The old MIDI source must not be used anymore, so we take
  // the message handler away from it.
  if (midiSource) {
    midiSource.onmidimessage = null;
  }
  midiSource = midi.inputs.get(id);
  // Register our message handler with the new source.
  if (midiSource) {
    midiSource.onmidimessage = handleMidiMessage;
  }
}

function midiConnectionStateChange(ev){
  console.log("MIDI connection change: " +
              ev.port.name + "; "+
              ev.port.connection + ", " +
              ev.port.state );  
  announceMidiSources();
}
