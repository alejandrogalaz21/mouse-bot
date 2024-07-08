// Move the mouse across the screen as a sine wave.
var robot = require("robotjs");

(() =>{
	console.clear();
	console.log("Mouse Mover is running. Press CTRL + C to exit.");
	// Speed up the mouse.
	robot.setMouseDelay(2);
	
	var twoPI = Math.PI * 2.0;
	var screenSize = robot.getScreenSize();
	var height = (screenSize.height / 2) - 10;
	var width = screenSize.width;
	
	
	while (true) {
		for (var x = 0; x < width; x++)
			{
				y = height * Math.sin((twoPI * x) / width) + height;
				robot.moveMouse(x, y);
			}
	}
})()