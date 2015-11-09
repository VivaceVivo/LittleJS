/*

	little.js

	setting up the Environment
*/

var audioContext;
var gain; // Master
var playing = false;
var sources = [];
var midiGains = [];

littleInitialization = function () {
	var stage = IDE_Morph.createStage;
	
	audioContext = initAudio();
	BlockMorph.prototype.sound = function (audioContext, input) {};
	
	var w = window;
	x = w.innerWidth || e.clientWidth || g.clientWidth
	editor = new ScriptsMorph(stage);
	editor.setExtent(new Point(x, 600));
	editor.bounds.origin.x = 600;

	world.add(editor);

	world.add(noiseSource(1, sources));
	world.add(periodicSource(2, sources));
	world.add(midiSource(3, sources));
	world.add(midi(4));
	world.add(biquadFilter(5));
	world.add(delay(6));
	world.add(panningFilter(7));
	world.add(speaker(8));
	
	var exeButton = new PushButtonMorph(null, execute, "play sound");
	//exeButton.label = "execute";
   //  exeButton.mouseClickLeft = function (pos) {
		// execute();
   //  }
	world.add(exeButton);
	MorphicPreferences.useSliderForInput=true;
	initialiseMidi();
	
};

initAudio = function(){
	audioContext = new window.AudioContext;
	gain = audioContext.createGain();
	return audioContext;
}

/*
var filter = function(pos){
	 var command = new CommandBlockMorph();
	 command.bounds.origin = (new Point(10, 45 * pos));
	 command.setSpec("filter");
	 command.mouseClickLeft = function (pos) {
		var command2 = new CommandBlockMorph();
		var freq = new InputSlotMorph("freq.", true);
		freq.setContents(440);
		var superReactToKeystroke = freq.reactToKeystroke;
		freq.reactToKeystroke = function(){
			filter.frequency.value = freq.evaluate();
			//superReactToKeystroke();
		}
		var superReactToEdit = freq.reactToEdit;
		freq.reactToEdit = function(){
			world.activeMenu.items[0].start = 1;
			world.activeMenu.items[0].stop = 4000;
			//superReactToEdit();
		}
		var superReactToSliderEdit = freq.reactToSliderEdit
		freq.reactToSliderEdit = function(){
			filter.frequency.value = freq.evaluate();
			//superReactToSliderEdit();
		}

		freq.executeOnSliderEdit = true;
		
        freq.fixLayout();

		var filter;
		command2.mouseClickLeft = function (pos) {command2.pickUp();}
		command2.sound = function(audioContext, input){
			// FILTER PART
			filter = audioContext.createBiquadFilter();
			// kind of filter
			filter.type = "lowpass";
			// characteristic frequency
			filter.frequency.value = freq.evaluate();
			// Q value
			filter.Q = 50;
			// gain
			filter.gain = 0;
			input.connect(filter);
			input.gain= 0.5;
			return filter;
		}

		command2.add(new StringMorph("filter"));
		command2.add(freq);
		command2.fixLayout();
		world.add(command2);
		command2.pickUp();
	
	}
	return command;
}
*/

var speaker = function(pos){
	var command = new CommandBlockMorph();
	command.bounds.origin = (new Point(10, 45 * pos));
	command.setSpec("speaker");
	command.mouseClickLeft = function (pos) {
		var command2 = new CommandBlockMorph();
		command2.setSpec("speaker");
		command2.mouseClickLeft = function (pos) {command2.pickUp();}
		command2.sound = function(audioContext, input){
			// Plug it in.
			// input.start(0);
			input.connect(gain);
		}
		world.add(command2);

		//pic = new Image();
		//pic.src="images/speaker.png";
		//world.add(pic);

		command2.pickUp();
	}
	return command;
}

/*
var noise = function(pos){
	 var command = new HatBlockMorph();
	 command.bounds.origin = (new Point(10, 45 * pos));
	 command.setSpec("white noise");
	 command.mouseClickLeft = function (pos) {
		var command2 = new HatBlockMorph();
		command2.setSpec("white noise");
		command2.mouseClickLeft = function (pos) {command2.pickUp();}
		
		world.add(command2);
		command2.sound = function(audioContext, input){
			// Generate buffer for 5 seconds white noise (1 channel)
			var lengthInSamples = 5 * audioContext.sampleRate;
			var buffer = audioContext.createBuffer(1, lengthInSamples, audioContext.sampleRate);
			var data = buffer.getChannelData(0);
			// Quote: non-interleaved IEEE 32-bit linear PCM with a nominal range of -1 -> +1
			for (var i = 0; i < lengthInSamples; i++) {
			  //data[i] = ((Math.random() * 2) - 1);
			  data[i] = (Math.random() - 0.5);
			}
						
			// Create a source node from the buffer.
			var bufferSource = audioContext.createBufferSource();
			bufferSource.buffer = buffer;
			bufferSource.loop = true;

			bufferSource.start(0);
			return bufferSource;
		}
		command2.pickUp();
		sources.push(command2);
	}
	
	 return command;
}
*/
var execute = function(){

	// BEGIN
	// Added without understanding the rest
	if(!playing){
		playing = true;
		gain = audioContext.createGain();
		gain.connect(audioContext.destination);

		for(src of sources){
			var blocksequence = src.blockSequence();
			var pipe = src.sound(audioContext, pipe);

			for(block of blocksequence){
				pipe = block.sound(audioContext, pipe);
			}
		}
	 }else{
		playing = false;
		gain.disconnect(audioContext.destination);
		gain = null;
	}
	// END
	
	

}