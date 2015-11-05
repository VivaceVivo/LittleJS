/*

    little.js

    setting up the Environment
*/

var audioContext;
var gain;
var playing = false;

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
    src = source(1);
    world.add(src);
    //editor.children.push(src);
    world.add(filter(2));
    world.add(noise(3));
    world.add(speaker(4));
    
    var exeButton = new PushButtonMorph();
    exeButton.label = "execute";
    exeButton.mouseClickLeft = function (pos) {
 	execute();
    }
    world.add(exeButton);
 	
};

initAudio = function(){
    audioContext = new window.AudioContext;
    gain = audioContext.createGain();
    return audioContext;
}

var source = function(pos){
    
    var h = new HatBlockMorph();
    
    h.bounds.origin = (new Point(10, 45 * pos));
    h.setSpec("SOURCE");
    
    h.mouseClickLeft = function (pos) {h.pickUp();};	
    return h;
};


var filter = function(pos){
    var command = new CommandBlockMorph();
    command.bounds.origin = (new Point(10, 45 * pos));
    command.setSpec("filter");
    command.mouseClickLeft = function (pos) {
	var command2 = new CommandBlockMorph();
	command2.setSpec("filter");
	command2.mouseClickLeft = function (pos) {command2.pickUp();}
	command2.sound = function(audioContext, input){
	    // FILTER PART
	    var filter = audioContext.createBiquadFilter();
	    // kind of filter
	    filter.type = "lowpass";
	    // characteristic frequency
	    filter.frequency.value = 440;
	    // Q value
	    filter.Q = 50;
	    // gain
	    filter.gain = 0;
	    input.connect(filter);
	    input.gain= 0.5;
	    return filter;
	}
	world.add(command2);
	command2.pickUp();
    }
    return command;
}

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
	command2.pickUp();
    }
    return command;
}

var noise = function(pos){
	 var command = new CommandBlockMorph();
	 command.bounds.origin = (new Point(10, 45 * pos));
	 command.setSpec("white noise");
	 command.mouseClickLeft = function (pos) {
		var command2 = new CommandBlockMorph();
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
			
			//bufferSource.connect(audioContext.destination);

			bufferSource.start(0);
			return bufferSource;
		}
		command2.pickUp();
	}
	
	 return command;
}

var execute = function(){
    // BEGIN
    // Added without understanding the rest
    if(!playing){
	playing = true;
	gain.connect(audioContext.destination);
    }else{
	playing = false;
	gain.disconnect(audioContext.destination);
    }
    // END
    
    var blocksequence = src.blockSequence();
    var pipe;
    for(block of blocksequence){
	pipe = block.sound(audioContext, pipe);
    }


}
