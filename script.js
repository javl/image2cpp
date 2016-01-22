
// Add events to the file input button
var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('click', function(){this.value = null;}, false);
fileInput.addEventListener('change', handleImageSelection, false);


// Filetypes accepted by the file picker
var fileTypes = ['jpg', 'jpeg', 'png', 'bmp', 'gif'];


// The canvas we will draw on
var canvas = document.getElementById('imageCanvas');
var ctx = canvas.getContext('2d');


// The variable to hold our image. Global so we can easily reuse it when the
// user updates the settings (change canvas size, scale, invert, etc)
var img = new Image();


// A bunch of settings used when converting
var settings = {
	screenWidth: 128,
	screenHeight: 64,
	scaleToFit: true,
	preserveRatio: true,
	centerHorizontally: false,
	centerVertically: false,
	backgroundColor: "white",
	scale: '1',
	drawMode: 'horizontal',
	threshold: 128,
	addArduinoCode: false,
	invertColors: false
};


// Easy way to update settings controlled by a textfield
function updateInteger(fieldName){
	settings[fieldName] = document.getElementById(fieldName).value;
	place_image();
}


// Easy way to update settings controlled by a checkbox
function updateBoolean(fieldName){
	settings[fieldName] = document.getElementById(fieldName).checked;
	place_image();
}


// Easy way to update settings controlled by a radiobutton
function updateRadio(fieldName){
	var radioGroup = document.getElementsByName(fieldName);
	for (var i = 0; i < radioGroup.length; i++) {
		if (radioGroup[i].checked) {
			settings[fieldName] = radioGroup[i].value;
		}
	}
	place_image();
}


// Make the canvas black and white
function blackAndWhite(){
	var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
	var data = imageData.data;
	for (var i = 0; i < data.length; i += 4) {
		var avg = (data[i] + data[i +1] + data[i +2]) / 3;
		if (settings['invertColors']){
			avg > settings['threshold'] ? avg = 0 : avg = 255;
		}else{
			avg > settings['threshold'] ? avg = 255 : avg = 0;
		}
		data[i]     = avg; // red
		data[i + 1] = avg; // green
		data[i + 2] = avg; // blue
	}
	ctx.putImageData(imageData, 0, 0);
};


// Invert the colors of the canvas
function invert() {
	var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
	var data = imageData.data;
	for (var i = 0; i < data.length; i += 4) {
		data[i]     = 255 - data[i];     // red
		data[i + 1] = 255 - data[i + 1]; // green
		data[i + 2] = 255 - data[i + 2]; // blue
	}
	ctx.putImageData(imageData, 0, 0);
};


// Draw the image onto the canvas, taking into account color and scaling
function place_image(){

	// Make sure we're using the right canvas size
	canvas.width = settings['screenWidth'];
	canvas.height = settings['screenHeight'];

	// Invert colors if needed
	if (settings['invertColors']){
		settings['backgroundColor'] == 'white' ? ctx.fillStyle = 'black' : ctx.fillStyle = 'white';
	}else{
		ctx.fillStyle = settings['backgroundColor'];
	}
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Offset used for centering the image when requested
	var offset_x = 0;
	var offset_y = 0;

	switch(settings['scale']){
		case '1': // Original
			if(settings['centerHorizontally']){ offset_x = (canvas.width - img.width) / 2; }
			if(settings['centerVertically']){ offset_y = (canvas.height - img.height) / 2; }
			ctx.drawImage(img, 0, 0, img.width, img.height,
				offset_x, offset_y, img.width, img.height);
		break;
		case '2': // Fit (make as large as possible without changing ratio)
			var horRatio = canvas.width / img.width;
			var verRatio =  canvas.height / img.height;
			var useRatio  = Math.min(horRatio, verRatio);

			if(settings['centerHorizontally']){ offset_x = (canvas.width - img.width*useRatio) / 2; }
			if(settings['centerVertically']){ offset_y = (canvas.height - img.height*useRatio) / 2; }
			ctx.drawImage(img, 0, 0, img.width, img.height,
				offset_x, offset_y, img.width * useRatio, img.height * useRatio);
		break;
		case '3': // Stretch x+y (make as large as possible without keeping ratio)
			ctx.drawImage(img, 0, 0, img.width, img.height,
				offset_x, offset_y, canvas.width, canvas.height);
		break;
		case '4': // Stretch x (make as wide as possible)
			offset_x = 0;
			if(settings['centerVertically']){ offset_y = (canvas.height - img.height) / 2; }
			ctx.drawImage(img, 0, 0, img.width, img.height,
				offset_x, offset_y, canvas.width, img.height);
		break;
		case '5': // Stretch y (make as tall as possible)
			if(settings['centerHorizontally']){ offset_x = (canvas.width - img.width) / 2; }
			offset_y = 0;
			ctx.drawImage(img, 0, 0, img.width, img.height,
				offset_x, offset_y, img.width, canvas.height);
		break;
	}
	// Make sure the image is black and white
	blackAndWhite();
}


// Handle inserting an image by pasting code
function handleTextInput(drawMode){

	var input = document.getElementById('textInput').value;

	// Remove Arduino code
	input = input.replace(/const unsigned char myBitmap \[\] PROGMEM = \{/g, "");
	input = input.replace(/\};/g, "");

	// Remove newlines
	input = input.replace(/\r\n|\r|\n/g, "");
	// Remove whitespace
	input = input.replace(/\s/g, "");
	// Remove "0x"
	input = input.replace(/0x/g, "");
	// Split into list
	var list = input.split(",");

	if(drawMode == 'horizontal'){
		listToImageHorizontal(list);
	}else{
		listToImageVertical(list);
	}
}


// Handle selecting an image with the file picker
function handleImageSelection(e){
	var reader = new FileReader();
	reader.onload = function(event){
		// Crude check to see if the uploaded file is an image
		if (reader.result.substring (0, 10) != "data:image"){
			alert("Please select an image file.");
			return false;
		}

		img.onload = function(){
			// Show the size underneath the file picker
			document.getElementById('imageSize').innerHTML = img.width+" * " + img.height + " pixels";

			// Resize the canvas and update the input fields
			document.getElementById('screenWidth').value = img.width;
			document.getElementById('screenHeight').value = img.height;
			settings['screenWidth'] = img.width;
			settings['screenHeight'] = img.height;

			place_image();
		}
		img.src = event.target.result;
	}
	reader.readAsDataURL(e.target.files[0]);
}


// Output the image as a string for horizontally drawing displays
function imageToStringHorizontal(){
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	var output_string = "";
	var output_index = 0;

	var byteIndex = 7;
	var number = 0;

	for (var index=0; index < imageData.data.length; index+=4){
		var avg = (imageData.data[index] + imageData.data[index +1] + imageData.data[index +2]) / 3;
		if (avg > settings['threshold']){
			number += Math.pow(2, byteIndex);
		}
		byteIndex--;

		if(byteIndex < 0){
			var byteSet = number.toString(16);
			if (byteSet.length == 1){ byteSet = "0"+byteSet; }
			var b = "0x"+byteSet;
			output_string += b+", ";
			output_index++;
			if (output_index >= 16){
				output_string += "\n";
				output_index = 0;
			}
			number = 0;
			byteIndex = 7;
		}
	}
	return output_string;
}


// Output the image as a string for vertically drawing displays
function imageToStringVertical(){
	var x = 0;
	var y = 7;
	var page = 0;

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;

	var output_string = "";
	var output_index = 0;


	for (var p=0; p<Math.ceil(settings['screenHeight']/8);p++){
		for (var x=0;x<=settings['screenWidth'];x++){
		// for (var x=0;x<1;x++){
			var byteIndex = 7;
			var number = 0;

			for (var y = 7; y >= 0; y--){
				var index = ((p*8)+y)*(settings['screenWidth']*4)+x;
				var avg = (data[index] + data[index +1] + data[index +2]) / 3;
				if (avg > settings['threshold']){
					number += Math.pow(2, byteIndex);
				}
				byteIndex--;
			}
			var byteSet = number.toString(16);
			if (byteSet.length == 1){ byteSet = "0"+byteSet; }
			var b = "0x"+byteSet.toString(16);
			output_string += b+", ";
			output_index++;
			if (output_index >= 16){
				output_string += "\n";
				output_index = 0;
			}
		}
	}
	return output_string;
}


// Output the image string to the textfield
function outputString(){
	var output_string = "";
	if (settings['drawMode'] == 'horizontal'){
		output_string = imageToStringHorizontal();
	}else{
		output_string = imageToStringVertical();
	}

	if(settings['addArduinoCode']){
		output_string = "const unsigned char myBitmap [] PROGMEM = {\n" + output_string + "\n};";
	}
	document.getElementById('outputField').value = output_string;
}


// Use the horizontally oriented list to draw the image
function listToImageHorizontal(list){

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var imgData = ctx.createImageData(canvas.width, canvas.height);

	var index = 0;

	var page = 0;
	var x = 0;
	var y = 7;

	// Move the list into the imageData object
	for (var i=0;i<list.length;i++){
		var binString = hexToBinary(list[i]).result;
		if (binString.length == 4){
			binString = binString + "0000";
		}

		// Check if pixel is white or black
		for(var k=0; k<binString.length; k++){
			var color = 0;
			if(binString.charAt(k) == '1'){
				color = 255;
			}
			imgData.data[index] = color;
			imgData.data[index+1] = color;
			imgData.data[index+2] = color;
			imgData.data[index+3] = 255;

			index += 4
		}
	}

	// Draw the image onto the canvas, then save the canvas contents
	// inside the img object. This way we can reuse the img object when
	// we want to scale / invert, etc.
	ctx.putImageData(imgData, 0, 0);
	img.src = canvas.toDataURL('image/png');
}


// Use the vertically oriented list to draw the image
function listToImageVertical(list){

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Create a new imageData object, but 90 degrees rotates (height x width)
	// var imgData = ctx.createImageData(canvas.width, canvas.height);
	// var imgData = ctx.getImageData(0, 0, canvas.height, canvas.width);
	//var imgData = ctx.createImageData(canvas.width, canvas.height);
	// var data = imgData.data;

	var index = 0;

	var page = 0;
	var x = 0;
	var y = 7;

	// Move the list into the imageData object
	for (var i=0;i<list.length;i++){

		var binString = hexToBinary(list[i]).result;
		if (binString.length == 4){
			binString = binString + "0000";
		}

		// Check if pixel is white or black
		for(var k=0; k<binString.length; k++){
			var color = 0;
			if(binString.charAt(k) == '1'){
				color = 255;
			}
			// color = 0;
			drawPixel(x, (page*8)+y, color);
			y--;
			if(y < 0){
				y = 7;
				x++;
				if(x >= settings['screenWidth']){
					x = 0;
					page++;
				}
			 }

		}
	}
	// Save the canvas contents inside the img object. This way we can
	// reuse the img object when we want to scale / invert, etc.
	img.src = canvas.toDataURL('image/png');
}


// Convert hex to binary
function hexToBinary(s) {

	var i, k, part, ret = '';
	// lookup table for easier conversion. '0' characters are padded for '1' to '7'
	var lookupTable = {
		'0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
		'5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
		'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
		'e': '1110', 'f': '1111',
		'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101',
		'E': '1110', 'F': '1111'
	};
	for (i = 0; i < s.length; i += 1) {
		if (lookupTable.hasOwnProperty(s[i])) {
			ret += lookupTable[s[i]];
		} else {
			return { valid: false };
		}
	}
	return { valid: true, result: ret };
}


// Quick and effective way to draw single pixels onto the canvas
// using a global 1x1px large canvas
var single_pixel = ctx.createImageData(1,1);
var d  = single_pixel.data;

function drawPixel(x, y, color){
	d[0] = color;
	d[1] = color;
	d[2] = color;
	d[3] = 255;
	ctx.putImageData(single_pixel, x, y);
}