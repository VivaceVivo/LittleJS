/*

    little.js

    setting up the Environment
*/

littleInitialization = function () {
	var w = window;
	x = w.innerWidth || e.clientWidth || g.clientWidth
	editor = new ScriptsMorph();
    editor.setExtent(new Point(x, 600));
    editor.bounds.origin.x = 600;
	world.add(editor);
	world.add(source(1));
 	world.add(filter(2));
 	world.add(filter2(3));
};

var source = function(pos){
	var h = new HatBlockMorph();
	
	h.bounds.origin = (new Point(10, 45 * pos));
	h.setSpec("SOURCE");
	h.mouseClickLeft = function (pos) {
		var h2 = new HatBlockMorph();
		h2.setSpec("SOURCE");
		h2.mouseClickLeft = function (pos) {h2.pickUp();}
		world.add(h2);
		h2.pickUp();
	}
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
		world.add(command2);
		command2.pickUp();
	}
	 return command;
}

var filter2 = function(pos){
	 var command = new CommandBlockMorph();
	 command.bounds.origin = (new Point(10, 45 * pos));
	 command.setSpec("filter 2");
	 command.mouseClickLeft = function (pos) {
		var command2 = new CommandBlockMorph();
		command2.setSpec("filter 2");
		command2.mouseClickLeft = function (pos) {command2.pickUp();}
		world.add(command2);
		command2.pickUp();
	}
	 return command;
}