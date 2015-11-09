/**
  * This file contains all Sound Bits to place on the canvas.
  *  
  * readme:
  * http://stackoverflow.com/questions/11542192/override-function-in-javascript
  */

  // FILTERS

var createFilterBlock = function(filterType){
	var block = new CommandBlockMorph();
	block.setSpec(filterType + "-filter");
	return block;
}

var createParameterSlot = function(setValue, defaultValue, min, max){
	var paramSlot = new InputSlotMorph(defaultValue, true);
	paramSlot.setContents(defaultValue);

	paramSlot.reactToKeystroke = function(){
		setValue(paramSlot.evaluate());
	}
	paramSlot.reactToEdit = function(){
		world.activeMenu.items[0].start = min;
		world.activeMenu.items[0].stop = max;
		world.activeMenu.items[0].value = defaultValue;
	}
	paramSlot.reactToSliderEdit = function(){
		setValue(paramSlot.evaluate());
	}
	paramSlot.executeOnSliderEdit = true;
	paramSlot.fixLayout();
	return paramSlot;
}


var biquadFilter = function(pos){
	
	var biquadTemplate = createFilterBlock("biquad");
	biquadTemplate.bounds.origin = (new Point(10, 45 * pos));
	biquadTemplate.fixLayout();
	world.add(biquadTemplate);

	biquadTemplate.mouseClickLeft = function (pos) {
		var filter = audioContext.createBiquadFilter();

		var biquad = createFilterBlock("biquad");

		// frequency slider
		// lambda for setting the value in filter:
		var setFrequency = function(value){filter.frequency.value = value;}
		var freq = createParameterSlot(setFrequency, 440, 1, 4000);
		biquad.add(new StringMorph("freq."));
		biquad.add(freq);

		// Q slider
		var setQ = function(value){filter.Q.value = value;}

		var qu = createParameterSlot(setQ, 50, 0, 100);
		biquad.add(new StringMorph("Q"));
		biquad.add(qu);

		biquad.mouseClickLeft = function (pos) {biquad.pickUp();}
		biquad.sound = function(audioContext, input){
			// FILTER PART
			filter.type = "lowpass";
			// characteristic frequency
			filter.frequency.value = freq.evaluate();
			// Q value
			filter.Q = 50;
			// gain
			filter.gain = 0;
			input.connect(filter);
			input.gain= 50;
			return filter;
		}

		biquad.fixLayout();
		world.add(biquad);
		biquad.pickUp();
	}

	return biquadTemplate;
}

var panningFilter = function(pos){
	
	var panningTemplate = createFilterBlock("pannning");
	panningTemplate.bounds.origin = (new Point(10, 45 * pos));
	panningTemplate.fixLayout();
	world.add(panningTemplate);

	panningTemplate.mouseClickLeft = function (pos) {
		var filter = audioContext.createPanner();
		var panning = createFilterBlock("panning");

		// frequency slider
		// lambda for setting the value in filter:
		var x = 0;
		var y = 0;
		var z = 0;
		var setX = function(value){x = value;filter.setPosition(x/10,y/10,z/10);}
		var slideX = createParameterSlot(setX, 0, -30, 30);
		panning.add(new StringMorph("X"));
		panning.add(slideX);

		var setY = function(value){y = value;filter.setPosition(x/10,y/10,z/10);}
		var slideY = createParameterSlot(setY, 0, -30, 30);
		panning.add(new StringMorph("Y"));
		panning.add(slideY);

		var setZ = function(value){z = value;filter.setPosition(x/10,y/10,z/10);}
		var slideZ = createParameterSlot(setZ, 0, -30, 30);
		panning.add(new StringMorph("Z"));
		panning.add(slideZ);

		panning.mouseClickLeft = function (pos) {panning.pickUp();}
		panning.sound = function(audioContext, input){

			// FILTER PART
			filter.setPosition(x,y,z);
			
			input.connect(filter);
			
			return filter;
		}

		panning.fixLayout();
		world.add(panning);
		panning.pickUp();
	}

	return panningTemplate;
}

var delay = function(pos){
	
	var delayTemplate = createFilterBlock("delay");
	delayTemplate.bounds.origin = (new Point(10, 45 * pos));
	delayTemplate.fixLayout();
	world.add(delayTemplate);

	delayTemplate.mouseClickLeft = function (pos) {
		var filter = audioContext.createDelay(20);

		var delay = createFilterBlock("delay");

		// frequency slider
		// lambda for setting the value in filter:
		var setTime = function(value){filter.delayTime.value = value;}
		var time = createParameterSlot(setTime, 5, 0, 20);
		delay.add(new StringMorph("time"));
		delay.add(time);

		delay.mouseClickLeft = function (pos) {delay.pickUp();}
		delay.sound = function(audioContext, input){
			filter.delayTime.value = time.evaluate();
			input.connect(filter);
			return filter;
		}

		delay.fixLayout();
		world.add(delay);
		delay.pickUp();
	}

	return delayTemplate;
}

var midi = function(pos){
	
	var midiTemplate = createFilterBlock("midi");
	midiTemplate.bounds.origin = (new Point(10, 45 * pos));
	midiTemplate.fixLayout();
	world.add(midiTemplate);

	midiTemplate.mouseClickLeft = function (pos) {
		var midiGain = audioContext.createGain();

		var midi = createFilterBlock("midi");

		midi.mouseClickLeft = function (pos) {midi.pickUp();}
		midi.sound = function(audioContext, input){
			// TODO midi
			midiGains.push({g:midiGain.gain, i:input});
			midiGain.gain.value = 0;
			input.connect(midiGain);
			return midiGain;
		}

		midi.fixLayout();
		world.add(midi);
		midi.pickUp();
	}

	return midiTemplate;
}

// SOURCES

var createSourceBlock = function(label){
	var block = new HatBlockMorph();
	block.setSpec(label);
	block.color = new Color(0,200,0);
	return block;
}

var noiseSource = function(pos, sources){
	 var noiseTemplate = createSourceBlock("white noise");
	 noiseTemplate.bounds.origin = (new Point(10, 45 * pos));
	 noiseTemplate.fixLayout();

	 noiseTemplate.mouseClickLeft = function (pos) {
		var noise = createSourceBlock("white noise");
		noise.mouseClickLeft = function (pos) {noise.pickUp();}
		
		world.add(noise);
		noise.sound = function(audioContext, input){
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
		noise.fixLayout();
		noise.pickUp();
		sources.push(noise);
	}
	
	 return noiseTemplate;
}

var periodicSource = function(pos, sources){
	 var periodicTemplate = createSourceBlock("periodic");
	 periodicTemplate.bounds.origin = (new Point(10, 45 * pos));
	 periodicTemplate.fixLayout();

	 periodicTemplate.mouseClickLeft = function (pos) {
		var periodic = createSourceBlock("periodic");
		periodic.mouseClickLeft = function (pos) {periodic.pickUp();}

		// frequency slider
		// lambda for setting the value in filter:
		var frequency = 60;
		var setFrequency = function(value){frequency = value;}
		var freq = createParameterSlot(setFrequency, 60, 1, 2000);
		periodic.add(new StringMorph("freq."));
		periodic.add(freq);
		
		world.add(periodic);
		periodic.sound = function(audioContext, input){
		    var oscillator = audioContext.createOscillator();
		    // This is the periodic wave part
		    var realPart      = new Float32Array(
		       [0.0, 0.1, 0.0, 0.2, 0.0, 0.4, 0.0, 0.6, 0.0, 0.4, 0.0, 0.3, 0.0, 0.1])
		    var imaginaryPart = new Float32Array(
		       [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
		    var wave = audioContext.createPeriodicWave(realPart, imaginaryPart);
		    oscillator.setPeriodicWave(wave);
		    // Set the frequency of the oscillator
		    oscillator.frequency.value = frequency;
		    // oscillator.connect(audioContext.destination)
		    oscillator.start(0)
		    return oscillator;
		}
		periodic.fixLayout();
		periodic.pickUp();
		sources.push(periodic);
	}
	
	 return periodicTemplate;
}

var midiOszillatorSource = function(pos, sources){
	 var midiTemplate = createSourceBlock("midi");
	 midiTemplate.bounds.origin = (new Point(10, 45 * pos));
	 midiTemplate.fixLayout();

	 midiTemplate.mouseClickLeft = function (pos) {
		var midi = createSourceBlock("midi");
		midi.mouseClickLeft = function (pos) {midi.pickUp();}
 
		var waveForm= new InputSlotMorph("sine", false, {"sine":"sine","square":"square","sawtooth":"sawtooth","triangle":"triangle"}, true);
		midi.add(waveForm);
		
		world.add(midi);
		midi.sound = function(audioContext, input){
		    var oscillators = [];
		    var node = audioContext.createGain();

		    // TODO midi: start und stop durch methoden aus midi.js schalten lassen
		    midiManagement = new Object();
		    midiManagement.start = function(i){
				  if(oscillators[i]){
				    oscillators[i].stop(0);
				  }
				  oscillators[i] = audioContext.createOscillator();
				  console.log("setting wave form: " + waveForm.evaluate());
				  oscillators[i].type.value = waveForm.evaluate();	
				  oscillators[i].frequency.value = 440.0 * Math.pow(2,(i-69)/12);		
				  oscillators[i].connect(node);
				  oscillators[i].start(0);
			}
			midiManagement.stop = function(i){
				  if(oscillators[i]){
				    oscillators[i].stop(0);
				    oscillators[i] = null;
				  }
			}		  
		    return node;
		}
		midi.fixLayout();
		midi.pickUp();
		sources.push(midi);
	}
	
	 return midiTemplate;
}

var speaker = function(pos){
	var command = new CommandBlockMorph();
	command.bounds.origin = (new Point(10, 45 * pos));
	command.setSpec("speaker");
	command.color = new Color(200,0,0);
	command.mouseClickLeft = function (pos) {
		var command2 = new CommandBlockMorph();
		command2.setSpec("speaker");
		command2.color = new Color(200,0,0);
		command2.mouseClickLeft = function (pos) {command2.pickUp();}
		command2.sound = function(audioContext, input){
			// Plug it in.
			input.connect(gain);
		}
		world.add(command2);
		command2.fixLayout();
		command2.pickUp();
	}
	command.fixLayout();
	return command;
}