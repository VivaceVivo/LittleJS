/*

	little.js

	setting up the Environment
*/


/* evil GLOBALS: */
var audioContext;
var gain; // Master
var playing = false;
var sources = []; // all sources
var midiGains = []; // multiple gain for midi filters
var midiManagement; // has 'start' and 'stop' for keypresses
var exeButton;
var exeButtonColor;

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
	world.add(midiOszillatorSource(3, sources));
	world.add(midi(4));
	world.add(biquadFilter(5));
	world.add(delay(6));
	world.add(panningFilter(7));
	world.add(speaker(8));
	
	exeButton = new PushButtonMorph(null, execute, "play sound");
	exeButtonColor = exeButton.color;

	world.add(exeButton);
	MorphicPreferences.useSliderForInput=true;
	initialiseMidi();
	
};

initAudio = function(){
	audioContext = new window.AudioContext;
	gain = audioContext.createGain();
	return audioContext;
}

var execute = function(){

	if(!playing){
		playing = true;
		exeButton.color = new Color(0,200,0);
		exeButton.fixLayout();

		gain = audioContext.createGain();
		gain.connect(audioContext.destination);

		for(src of sources){
			var blocksequence = src.blockSequence();
			var pipe = src.sound(audioContext, pipe);
			console.log("Connecting : " + pipe);
			for(block of blocksequence){
				pipe = block.sound(audioContext, pipe);
				console.log("  --> " + pipe);
			}
		}
	 }else{
		playing = false;
		exeButton.color = exeButtonColor;
		exeButton.fixLayout();
		
		// disconnect midi gain
		for(mg of midiGains){
			if(mg.g && mg.g.disconnect){
				mg.g.disconnect(mg.i);
				console.log("disconnected gain: " + mg.g + " from " + mg.i);
			}
			mg.g = null;
		}
		if(gain && gain.disconnect){
			gain.disconnect(audioContext.destination);
			console.log("disconnected gain: " + gain + " from " + audioContext.destination);
		}
		gain = null;
		

	}
	

}