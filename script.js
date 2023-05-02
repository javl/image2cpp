
  var ConversionFunctions = {
    // Output the image as a string for horizontally drawing displays
    horizontal1bit: function (data, canvasWidth, canvasHeight){
      var output_string = "";
      var output_index = 0;

      var byteIndex = 7;
      var number = 0;

      // format is RGBA, so move 4 steps per pixel
      for(var index = 0; index < data.length; index += 4){
        // Get the average of the RGB (we ignore A)
        var avg = (data[index] + data[index + 1] + data[index + 2]) / 3;
        if(avg > settings["ditheringThreshold"]){
          number += Math.pow(2, byteIndex);
        }
        byteIndex--;

        // if this was the last pixel of a row or the last pixel of the
        // image, fill up the rest of our byte with zeros so it always contains 8 bits
        if ((index != 0 && (((index/4)+1)%(canvasWidth)) == 0 ) || (index == data.length-4)) {
          // for(var i=byteIndex;i>-1;i--){
            // number += Math.pow(2, i);
          // }
          byteIndex = -1;
        }

        // When we have the complete 8 bits, combine them into a hex value
        if(byteIndex < 0){
          var byteSet = bitswap(number).toString(16);
          if(byteSet.length == 1){ byteSet = "0"+byteSet; }
          if (!settings.removeZeroesCommas) {
            output_string += "0x" + byteSet + ", ";
          } else {
            output_string += byteSet;
          }
          output_index++;
          if(output_index >= 16){
            if (!settings.removeZeroesCommas) {
              output_string += "\n";
            }
            output_index = 0;
          }
          number = 0;
          byteIndex = 7;
        }
      }
      return output_string;
    },


    // Output the image as a string for vertically drawing displays
    vertical1bit: function (data, canvasWidth, canvasHeight){
      var output_string = "";
      var output_index = 0;

      for(var p=0; p < Math.ceil(settings["screenHeight"] / 8); p++){
        for(var x = 0; x < settings["screenWidth"]; x++){
          var byteIndex = 7;
          var number = 0;

          for (var y = 7; y >= 0; y--){
            var index = ((p*8)+y)*(settings["screenWidth"]*4)+x*4;
            var avg = (data[index] + data[index +1] + data[index +2]) / 3;
            if (avg > settings["ditheringThreshold"]){
              number += Math.pow(2, byteIndex);
            }
            byteIndex--;
          }
          var byteSet = bitswap(number).toString(16);
          if (byteSet.length == 1){ byteSet = "0"+byteSet; }
          if (!settings.removeZeroesCommas) {
            output_string += "0x" + byteSet.toString(16) + ", ";
          } else {
            output_string += byteSet.toString(16);
          }
          output_index++;
          if(output_index >= 16){
            output_string += "\n";
            output_index = 0;
          }
        }
      }
      return output_string;
    },

    // Output the image as a string for 565 displays (horizontally)
    horizontal565: function (data, canvasWidth, canvasHeight){
      var output_string = "";
      var output_index = 0;

      // format is RGBA, so move 4 steps per pixel
      for(var index = 0; index < data.length; index += 4){
        // Get the RGB values
        var r = data[index];
        var g = data[index + 1];
        var b = data[index + 2];
        // calculate the 565 color value
        var rgb = ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | ((b & 0b11111000) >> 3);
        // Split up the color value in two bytes
        var firstByte = (rgb >> 8) & 0xff;
        var secondByte = rgb & 0xff;

        var byteSet = bitswap(rgb).toString(16);
        while(byteSet.length < 4){ byteSet = "0" + byteSet; }
        if (!settings.removeZeroesCommas) {
          output_string += "0x" + byteSet + ", ";
        } else {
          output_string += byteSet;
        }
        // add newlines every 16 bytes
        output_index++;
        if(output_index >= 16){
          output_string += "\n";
          output_index = 0;
        }
      }
      return output_string;
    },
    // Output the image as a string for rgb888 displays (horizontally)
    horizontal888: function (data, canvasWidth, canvasHeight){
      var output_string = "";
      var output_index = 0;

      // format is RGBA, so move 4 steps per pixel
      for(var index = 0; index < data.length; index += 4){
        // Get the RGB values
        var r = data[index];
        var g = data[index + 1];
        var b = data[index + 2];
        // calculate the 565 color value
        var rgb = (r << 16) | (g << 8) | (b);
        // Split up the color value in two bytes
        var firstByte = (rgb >> 8) & 0xff;
        var secondByte = rgb & 0xff;

        var byteSet = bitswap(rgb).toString(16);
        while(byteSet.length < 8){ byteSet = "0" + byteSet; }
        if (!settings.removeZeroesCommas) {
          output_string += "0x" + byteSet + ", ";
        } else {
          output_string += byteSet;
        }

        // add newlines every 16 bytes
        output_index++;
        if(output_index >= canvasWidth){
          output_string += "\n";
          output_index = 0;
        }
      }
      return output_string;
    },
    // Output the alpha mask as a string for horizontally drawing displays
    horizontalAlpha: function (data, canvasWidth, canvasHeight){
      var output_string = "";
      var output_index = 0;

      var byteIndex = 7;
      var number = 0;

      // format is RGBA, so move 4 steps per pixel
      for(var index = 0; index < data.length; index += 4){
        // Get alpha part of the image data
        var alpha = data[index + 3];
        if(alpha > settings["ditheringThreshold"]){
          number += Math.pow(2, byteIndex);
        }
        byteIndex--;

        // if this was the last pixel of a row or the last pixel of the
        // image, fill up the rest of our byte with zeros so it always contains 8 bits
        if ((index != 0 && (((index/4)+1)%(canvasWidth)) == 0 ) || (index == data.length-4)) {
          byteIndex = -1;
        }

        // When we have the complete 8 bits, combine them into a hex value
        if(byteIndex < 0){
          var byteSet = bitswap(number).toString(16);
          if(byteSet.length == 1){ byteSet = "0"+byteSet; }
          if (!settings.removeZeroesCommas) {
            output_string += "0x"+byteSet + ", ";
          } else {
            output_string += byteSet;
          }
          output_index++;
          if(output_index >= 16){
            output_string += "\n";
            output_index = 0;
          }
          number = 0;
          byteIndex = 7;
        }
      }
      return output_string;
    }
  };


// A bunch of settings used when converting
  var settings = {
    screenWidth: 128,
    screenHeight: 64,
    scaleToFit: true,
    preserveRatio: true,
    centerHorizontally: false,
    centerVertically: false,
    flipHorizontally: false,
    flipVertically: false,
    backgroundColor: "white",
    scale: 1,
    drawMode: "horizontal",
    removeZeroesCommas: false,
    ditheringThreshold: 128,
    ditheringMode: 0,
    outputFormat: "plain",
    invertColors: false,
    rotation: 0,
    conversionFunction: ConversionFunctions.horizontal1bit
  };

  function bitswap(b) {
    if(settings["bitswap"]) {
      b = (b & 0xF0) >> 4 | (b & 0x0F) << 4;
      b = (b & 0xCC) >> 2 | (b & 0x33) << 2;
      b = (b & 0xAA) >> 1 | (b & 0x55) << 1;
    }
    return b;
  }

    // get the type (in arduino code) of the output image
  // this is a bit of a hack, it's better to make this a property of the conversion function (should probably turn it into objects)
  function getType() {
    if (settings.conversionFunction == ConversionFunctions.horizontal565) {
      return "uint16_t";
    }else if(settings.conversionFunction == ConversionFunctions.horizontal888){
      return "unsigned long";
    }else{
      return "unsigned char";
    }
  }


    // Invert the colors of the canvas
    function invert(canvas, ctx) {
      var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
      var data = imageData.data;
      for (var i = 0; i < data.length; i += 4) {
        data[i]     = 255 - data[i];     // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Draw the image onto the canvas, taking into account color and scaling
    function place_image(image){

      var img = image.img;
      var canvas = image.canvas;
      var ctx = canvas.getContext("2d");
      image.ctx = ctx;
      ctx.save();

      const flipHorizontal = settings["flipHorizontally"] ? -1 : 1;
      const flipVertical = settings["flipVertically"] ? -1 : 1;

      if (settings['rotation'] == 0) {
        canvas.width = settings['screenWidth'];
        canvas.height = settings['screenHeight'];
        const xTranslate = settings["flipHorizontally"] ? canvas.width : 0;
        const yTranslate = settings["flipVertically"] ? canvas.height : 0;
        ctx.setTransform(flipHorizontal, 0, 0, flipVertical, xTranslate, yTranslate);

      } else if (settings['rotation'] == 90) {
        canvas.width = settings['screenHeight'];
        canvas.height = settings['screenWidth'];
        const xTranslate = settings["flipHorizontally"] ? canvas.width : 0;
        const yTranslate = settings["flipVertically"] ? canvas.height : 0;
        ctx.setTransform(flipHorizontal, 0, 0, flipVertical, xTranslate, yTranslate);
        // ctx = canvas.getContext("2d");
        ctx.translate(canvas.width, 0);
        ctx.rotate(Math.PI/2);
        // ctx.translate(-canvas.width/2, 0);

      } else if (settings['rotation'] == 180) {
        canvas.width = settings['screenWidth'];
        canvas.height = settings['screenHeight'];
        const xTranslate = settings["flipHorizontally"] ? canvas.width : 0;
        const yTranslate = settings["flipVertically"] ? canvas.height : 0;
        ctx.setTransform(flipHorizontal, 0, 0, flipVertical, xTranslate, yTranslate);
        // Matrix transformation
        ctx.translate(canvas.width/2.0, canvas.height/2.0);
        ctx.rotate(Math.PI);
        ctx.translate(-canvas.width/2.0, -canvas.height/2.0);

      } else if (settings['rotation'] == 270) {
        canvas.width = settings['screenHeight'];
        canvas.height = settings['screenWidth'];
        const xTranslate = settings["flipHorizontally"] ? canvas.width : 0;
        const yTranslate = settings["flipVertically"] ? canvas.height : 0;
        ctx.setTransform(flipHorizontal, 0, 0, flipVertical, xTranslate, yTranslate);
        ctx.translate(0, canvas.height);
        ctx.rotate(-Math.PI*0.5);
      }

      // Draw background
      if (settings["backgroundColor"] == "transparent") {
        ctx.fillStyle = "rgba(0,0,0,0.0)";
        ctx.globalCompositeOperation = 'copy';
      } else {
        if (settings["invertColors"]){
          settings["backgroundColor"] == "white" ? ctx.fillStyle = "black" : ctx.fillStyle = "white";
        } else {
          ctx.fillStyle = settings["backgroundColor"];
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Offset used for centering the image when requested
      var offset_x = 0;
      var offset_y = 0;
      // var offset_x_dir = 1;
      // var offset_y_dir = 1;

      var imgW = img.width;
      var imgH = img.height;
      // if (settings['flipHorizontally']) {
        // imgW = -img.width;
        // offset_x_dir = -1;
      // }
      // if (settings['flipVertically']) {
        // imgH = -img.height;
        // offset_y_dir = -1;
      // }

      switch(settings["scale"]){
        case 1: // Original
          if(settings["centerHorizontally"]){ offset_x = Math.round((canvas.width - imgW) / 2); }
          if(settings["centerVertically"]){ offset_y = Math.round((canvas.height - imgH) / 2); }
          ctx.drawImage(img, 0, 0, imgW, imgH,
            offset_x, offset_y, imgW, imgH);
        break;
        case 2: // Fit (make as large as possible without changing ratio)
          var horRatio = canvas.width / imgW;
          var verRatio =  canvas.height / imgH;
          var useRatio  = Math.min(horRatio, verRatio);

          if(settings["centerHorizontally"]){ offset_x = Math.round((canvas.width - imgW*useRatio) / 2); }
          if(settings["centerVertically"]){ offset_y = Math.round((canvas.height - imgH*useRatio) / 2); }
          // offset_x *= offset_x_dir;
          // offset_y *= offset_y_dir;
          ctx.drawImage(img, 0, 0, imgW, imgH,
            offset_x, offset_y, imgW * useRatio, imgH * useRatio);
        break;
        case 3: // Stretch x+y (make as large as possible without keeping ratio)
          ctx.drawImage(img, 0, 0, imgW, imgH,
            offset_x, offset_y, canvas.width, canvas.height);
        break;
        case 4: // Stretch x (make as wide as possible)
          offset_x = 0;
          if(settings["centerVertically"]){ Math.round(offset_y = (canvas.height - imgH) / 2); }
          // offset_y *= offset_y_dir;
          ctx.drawImage(img, 0, 0, imgW, imgH,
            offset_x, offset_y, canvas.width, imgH);
        break;
        case 5: // Stretch y (make as tall as possible)
          if(settings["centerHorizontally"]){ offset_x = Math.round((canvas.width - imgW) / 2); }
          // offset_x *= offset_x_dir;
          offset_y = 0;
          ctx.drawImage(img, 0, 0, imgW, imgH,
            offset_x, offset_y, imgW, canvas.height);
        break;
      }
      ctx.restore();

      // Make sure the image is black and white
      if(settings.conversionFunction == ConversionFunctions.horizontal1bit
        || settings.conversionFunction == ConversionFunctions.vertical1bit) {
        dithering(ctx, canvas.width, canvas.height, settings.ditheringThreshold, settings.ditheringMode);(canvas, ctx);
        if(settings["invertColors"]){
          invert(canvas, ctx);
        }
      }
    }

    // Handle inserting an image by pasting code
    function handleTextInput(drawMode){

      var canvasContainer = document.getElementById("images-canvas-container");
      var canvas = document.createElement("canvas");

      canvas.width = parseInt(document.getElementById("text-input-width").value);
      canvas.height = parseInt(document.getElementById("text-input-height").value);
      settings["screenWidth"] = canvas.width;
      settings["screenHeight"] = canvas.height;

      if(canvasContainer.children.length) {
        canvasContainer.removeChild(canvasContainer.firstChild);
      }
      canvasContainer.appendChild(canvas);

      var image = new Image();
      images.setByIndex(0, {"img": image, "canvas" : canvas});

      var input = document.getElementById("byte-input").value;

      // Remove Arduino code
      input = input.replace(/const\s+(unsigned\s+char|uint8_t)\s+[a-zA-Z0-9]+\s*\[\]\s*(PROGMEM\s*)?=\s*/g, "");
      input = input.replace(/\};|\{/g, "");

      // Convert newlines to comma (helps to remove comments later)
      input = input.replace(/\r\n|\r|\n/g, ",");
      // Convert multiple commas in a row into a single one
      input = input.replace(/,{2,}/g, ",");
      // Remove whitespace
      input = input.replace(/\s/g, "");
      //Remove comments
      input = input.replace(/\/\/(.+?),/g, "");
      // Remove "0x"
      input = input.replace(/0[xX]/g, "");
      // Split into list
      var list = input.split(",");

      if(drawMode == "horizontal"){
        listToImageHorizontal(list, canvas);
      }else{
        listToImageVertical(list, canvas);
      }
    }

    function allSameSize(images, files) {
      if(images.length() > 1 && images.length() == files.length) {
        // multiple images settings container
        // var imageSizeSettings = document.getElementById("image-size-settings");
        var inputs = document.querySelectorAll("#image-size-settings input");
        allSameSizeButton.onclick = function() {
          for(var i = 2; i < inputs.length; i++) {
            if(inputs[i].name == "width") {
              inputs[i].value = inputs[0].value;
              inputs[i].oninput();
            }
            if(inputs[i].name == "height") {
              inputs[i].value = inputs[1].value;
              inputs[i].oninput();
            }

          }
        };
        allSameSizeButton.style.display = "block";
      }
    }

    // Handle selecting an image with the file picker
    function handleImageSelection(evt){

      var files = Array.from(evt.target.files);
      files.sort((a, b) => a.name > b.name);
      // error message
      var onlyImagesFileError = document.getElementById("only-images-file-error");

      onlyImagesFileError.style.display = "none";

      // initial message
      var noFileSelected = document.getElementById("no-file-selected");
      files.length > 0 ? noFileSelected.style.display = "none" : noFileSelected.style.display = "block";

      for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if(!f.type.match("image.*")) {
        onlyImagesFileError.style.display = "block";
          continue;
        }

        var reader = new FileReader();

        reader.onload = (function(file) {
          return function(e) {
            // Render thumbnail.
            var img = new Image();

            img.onload = function(){
              const fileInputColumnEntry = document.createElement("div");
              fileInputColumnEntry.className = "file-input-entry";

              const fileInputColumnEntryLabel = document.createElement("span");
              fileInputColumnEntryLabel.textContent = file.name;

              const fileInputColumnEntryRemoveButton = document.createElement("button");
              fileInputColumnEntryRemoveButton.className = "remove-button";
              fileInputColumnEntryRemoveButton.innerHTML = "remove";

              var canvas = document.createElement("canvas");

              var imageEntry = document.createElement("li");
              imageEntry.setAttribute("data-img", file.name);

              var w = document.createElement("input");
              w.type = "number";
              w.name = "width";
              w.id = "screenWidth";
              w.min = 0;
              w.className = "size-input";
              w.value = img.width;
              settings["screenWidth"] = img.width;
              w.oninput = function() { canvas.width = this.value; update(); updateInteger('screenWidth'); };

              var h = document.createElement("input");
              h.type = "number";
              h.name = "height";
              h.id = "screenHeight";
              h.min = 0;
              h.className = "size-input";
              h.value = img.height;
              settings["screenHeight"] = img.height;
              h.oninput = function() { canvas.height = this.value; update(); updateInteger('screenHeight'); };

              var gil = document.createElement("span");
              gil.innerHTML = "glyph";
              gil.className = "file-info";

              var gi = document.createElement("input");
              gi.type = "text";
              gi.name = "glyph";
              gi.className = "glyph-input";
              gi.onchange = function() {
                var image = images.get(img);
                image.glyph = gi.value;
              };

              var fn = document.createElement("span");
              fn.className = "file-info";
              fn.innerHTML = file.name + "  (file resolution: " + img.width + " x " + img.height + ")";
              fn.innerHTML += "<br />";

              var rb = document.createElement("button");
              rb.className = "remove-button";
              rb.innerHTML = "remove";

              var fileInputColumn = document.getElementById("file-input-column");
              var imageSizeSettings = document.getElementById("image-size-settings");
              var canvasContainer = document.getElementById("images-canvas-container");

              const removeButtonOnClick = function() {
                var image = images.get(img);
                canvasContainer.removeChild(image.canvas);
                images.remove(image);
                imageSizeSettings.removeChild(imageEntry);


                fileInputColumn.removeChild(fileInputColumnEntry);
                if(imageSizeSettings.children.length == 1) {
                  allSameSizeButton.style.display = "none";
                }
                if(images.length() == 0) noFileSelected.style.display = "block";
                update();
              };

              rb.onclick = removeButtonOnClick;
              fileInputColumnEntryRemoveButton.onclick = removeButtonOnClick;

              fileInputColumnEntry.appendChild(fileInputColumnEntryLabel);
              fileInputColumnEntry.appendChild(fileInputColumnEntryRemoveButton);
              fileInputColumn.appendChild(fileInputColumnEntry);

              imageEntry.appendChild(fn);
              imageEntry.appendChild(w);
              imageEntry.appendChild(document.createTextNode(" x "));
              imageEntry.appendChild(h);
              imageEntry.appendChild(gil);
              imageEntry.appendChild(gi);
              imageEntry.appendChild(rb);

              imageSizeSettings.appendChild(imageEntry);

              canvas.width = img.width;
              canvas.height = img.height;
              canvasContainer.appendChild(canvas);

              images.push(img, canvas, file.name.split(".")[0]);
              place_image(images.last());
              allSameSize(images, files);
            };
            img.src = e.target.result;
          };
        })(f);
        reader.readAsDataURL(f);
      }
    }

    function imageToString(image){
      // extract raw image data
      var ctx = image.ctx;
      var canvas = image.canvas;

      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imageData.data;
      return settings.conversionFunction(data, canvas.width, canvas.height);
    }

    // Get the custom arduino output variable name, if any
    function getIdentifier() {
      var vn = document.getElementById("identifier");
      return vn && vn.value.length ? vn.value : identifier;
    }

    // Output the image string to the textfield
    function outputString(){

      var output_string = "", count = 1;
      var code = "";

      switch(settings["outputFormat"]) {

        case "arduino": {
          let varQuickArray = [];
          let bytesUsed     = 0;
          // --
          images.each(function(image) {
            code = imageToString(image);

            // Trim whitespace from end and remove trailing comma
            code = code.replace(/,\s*$/,"");

            code = "\t" + code.split("\n").join("\n\t") + "\n";
            var variableCount = images.length() > 1 ? count++ : "";
            var comment = "// '" + image.glyph + "', "+image.canvas.width+"x"+image.canvas.height+"px\n";
            bytesUsed += code.split("\n").length * 16; // 16 bytes per line.

            let varname = getIdentifier() + image.glyph.replace(/[^a-zA-Z0-9]/g,"_");
            varQuickArray.push(varname);
            code = comment + "const " + getType() + " " + varname + " [] PROGMEM = {\n" + code + "};\n";
            output_string += code;
          });
          // --
          varQuickArray.sort();
          // --
          output_string += "\n// Array of all bitmaps for convenience. (Total bytes used to store images in PROGMEM = "+bytesUsed+")\n"
          output_string += "const int " + (getIdentifier()+"allArray_LEN") + " = " + varQuickArray.length + ";\n"
          output_string += "const " + getType() + "* " + (getIdentifier()+"allArray") + "["+varQuickArray.length+"] = {\n\t"+varQuickArray.join(",\n\t")+"\n};\n";
          // --
          break;
        }

        case "arduino_single": {
          var comment = "";
          images.each(function(image) {
            code = imageToString(image);
            code = "\t" + code.split("\n").join("\n\t") + "\n";
            comment = "\t// '" + image.glyph + ", " + image.canvas.width+"x"+image.canvas.height+"px\n";
            output_string += comment + code;
          });

          output_string = output_string.replace(/,\s*$/,"");

          output_string = "const " + getType() + " " +
            + getIdentifier()
            + " [] PROGMEM = {"
            + "\n" + output_string + "\n};";
          break;
        }

        case "adafruit_gfx": { // bitmap
          var comment = "";
          var useGlyphs = 0;
          images.each(function(image) {
            code = imageToString(image);
            code = "\t" + code.split("\n").join("\n\t") + "\n";
            comment = "\t// '" + image.glyph + ", " + image.canvas.width+"x"+image.canvas.height+"px\n";
            output_string += comment + code;
            if(image.glyph.length == 1) useGlyphs++;
          });

          output_string = output_string.replace(/,\s*$/,"");
          output_string = "const unsigned char "
            + getIdentifier()
            + "Bitmap"
            + " [] PROGMEM = {"
            + "\n" + output_string + "\n};\n\n"
            + "const GFXbitmapGlyph "
            + getIdentifier()
            + "Glyphs [] PROGMEM = {\n";

          var firstAschiiChar = document.getElementById("first-ascii-char").value;
          var xAdvance = parseInt(document.getElementById("x-advance").value);
          var offset = 0;
          code = "";

          // GFXbitmapGlyph
          images.each(function(image) {
            code += "\t{ "
              + offset + ", "
              + image.canvas.width + ", "
              + image.canvas.height + ", "
              + xAdvance + ", "
              + "'" + (images.length() == useGlyphs ?
                image.glyph :
                  String.fromCharCode(firstAschiiChar++)) + "'"
              + " }";
            if(image != images.last()){ code += ","; }
            code += "// '" + image.glyph + "'\n";
            offset += image.canvas.width;
          });
          code += "};\n";
          output_string += code;

          // GFXbitmapFont
          output_string += "\nconst GFXbitmapFont "
            + getIdentifier()
            + "Font PROGMEM = {\n"
            + "\t(uint8_t *)"
            + getIdentifier() + "Bitmap,\n"
            + "\t(GFXbitmapGlyph *)"
            + getIdentifier()
            + "Glyphs,\n"
            + "\t" + images.length()
            + "\n};\n";
          break;
        }
        default: { // plain
          images.each(function(image) {
            code = imageToString(image);
            var comment = image.glyph ? ("// '" + image.glyph + "', " + image.canvas.width+"x"+image.canvas.height+"px\n") : "";
            if(image.img != images.first().img) comment = "\n" + comment;
            code = comment + code;
            output_string += code;
          });
          // Trim whitespace from end and remove trailing comma
          output_string = output_string.replace(/,\s*$/g,"");
        }
      }

      document.getElementById("code-output").value = output_string;
      __output = output_string;
      document.getElementById("copy-button").disabled = false;
    }

    function copyOutput() {
      navigator.clipboard.writeText(__output);
    }

    function downloadFile() {
      raw = [];
      images.each((image) => {
        data = imageToString(image)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map((byte) => parseInt(byte, 16));
        raw = raw.concat(data);
      });
      data = new Uint8Array(raw);
      a = document.createElement("a");
      a.style = "display: none";
      document.body.appendChild(a);
      blob = new Blob([data], {type: "octet/stream"});
      url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = getIdentifier() + ".bin";
      a.click();
      window.URL.revokeObjectURL(url);
    }

    // Use the horizontally oriented list to draw the image
    function listToImageHorizontal(list, canvas){

      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var imgData = ctx.createImageData(canvas.width, canvas.height);

      var index = 0;

      var page = 0;
      var x = 0;
      var y = 7;
      // round the width up to the next byte
      var widthRoundedUp = Math.floor(canvas.width / 8 + (canvas.width % 8 ? 1 : 0)) * 8;
      var widthCounter = 0;

      // Move the list into the imageData object
      for (var i=0;i<list.length;i++){

        var binString = hexToBinary(list[i]);
        if(!binString.valid){
          alert("Something went wrong converting the string. Did you forget to remove any comments from the input?");
          console.log("invalid hexToBinary: ", binString.s);
          return;
        }
        binString = binString.result;
        if (binString.length == 4){
          binString = binString + "0000";
        }

        // Check if pixel is white or black
        for(var k=0; k<binString.length; k++, widthCounter++){
          // if we've counted enough bits, reset counter for next line
          if(widthCounter >= widthRoundedUp) {
            widthCounter = 0;
          }
          // skip 'artifact' pixels due to rounding up to a byte
          if(widthCounter >= canvas.width) {
            continue;
          }
          var color = 0;
          if(binString.charAt(k) == "1"){
            color = 255;
          }
          imgData.data[index] = color;
          imgData.data[index+1] = color;
          imgData.data[index+2] = color;
          imgData.data[index+3] = 255;

          index += 4;
        }
      }

      // Draw the image onto the canvas, then save the canvas contents
      // inside the img object. This way we can reuse the img object when
      // we want to scale / invert, etc.
      ctx.putImageData(imgData, 0, 0);
      var img = new Image();
      img.src = canvas.toDataURL("image/png");
      images.first().img = img;
    }


  function updateDrawMode(elm) {
    // var note = document.getElementById("note1bit");
    // if(elm.value == "horizontal1bit" || elm.value == "vertical1bit") {
    //   note.style.display = "block";
    // } else {
    //   note.style.display = "none";
    // }

    var conversionFunction = ConversionFunctions[elm.value];
    if(conversionFunction) {
      settings.conversionFunction = conversionFunction;
    }
  }


  // Updates Arduino code check-box
  function updateOutputFormat(elm) {
    var caption = document.getElementById("format-caption-container");
    var adafruitGfx = document.getElementById("adafruit-gfx-settings");
    var arduino = document.getElementById("arduino-identifier");
    var removeZeroesCommasContainer = document.getElementById("remove-zeroes-commas-container");

    for(var i = 0; i < caption.children.length; i++) {
      caption.children[i].style.display = "none";
    }
    caption = document.querySelector("div[data-caption='" + elm.value + "']");
    if(caption) caption.style.display = "block";

    if (elm.value != "plain") {
      arduino.style.display = "block";
      removeZeroesCommasContainer.style.display = "none";
      settings.removeZeroesCommas = false;
    } else {
      arduino.style.display = "none";
      removeZeroesCommasContainer.style.display = "table-row";
    }
    elm.value == "adafruit_gfx" ? adafruitGfx.style.display = "block" : adafruitGfx.style.display = "none";

    settings["outputFormat"] = elm.value;
  }


    // An images collection with helper methods
    function Images() {
      var collection = [];
      this.push = function(img, canvas, glyph) {
        collection.push({ "img" : img, "canvas" : canvas, "glyph" : glyph });
      };
      this.remove = function(image) {
        var i = collection.indexOf(image);
        if(i != -1) collection.splice(i, 1);
      };
      this.each = function(f) { collection.forEach(f); };
      this.length = function() { return collection.length; };
      this.first = function() { return collection[0]; };
      this.last = function() { return collection[collection.length - 1]; };
      this.getByIndex = function(index) { return collection[index]; };
      this.setByIndex = function(index, img) { collection[index] = img; };
      this.get = function(img) {
        if(img) {
          for(var i = 0; i < collection.length; i++) {
            if(collection[i].img == img) {
              return collection[i];
            }
          }
        }
        return collection;
      };
      return this;
    }

    function update() {
      images.each(function(image) { place_image(image); });
    }

    // Easy way to update settings controlled by a textfield
    function updateInteger(fieldName){
      settings[fieldName] = parseInt(document.getElementById(fieldName).value);
      update();
    }

    // Easy way to update settings controlled by a checkbox
    function updateBoolean(fieldName){
      settings[fieldName] = document.getElementById(fieldName).checked;
      update();
    }

    // Easy way to update settings controlled by a radiobutton
    function updateRadio(fieldName){
      var radioGroup = document.getElementsByName(fieldName);
      for (var i = 0; i < radioGroup.length; i++) {
        if (radioGroup[i].checked) {
          settings[fieldName] = radioGroup[i].value;
        }
      }
      update();
    }

  var images = new Images();

  window.onload = function () {

    document.getElementById("copy-button").disabled = true;
    var __output;

    // Add events to the file input button
    var fileInput = document.getElementById("file-input");
    fileInput.addEventListener("click", function(){this.value = null;}, false);
    fileInput.addEventListener("change", handleImageSelection, false);

    // Filetypes accepted by the file picker
    var fileTypes = ["jpg", "jpeg", "png", "bmp", "gif", "svg"];

  // all images same size button
  var allSameSizeButton = document.getElementById("all-same-size");

  // The variable to hold our images. Global so we can easily reuse it when the
  // user updates the settings (change canvas size, scale, invert, etc)


  // Variable name, when "arduino code" is required
  var identifier = "myBitmap";



  // // Make the canvas black and white
  // function blackAndWhite(canvas, ctx){
  //   var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
  //   var data = imageData.data;
  //   for (var i = 0; i < data.length; i += 4) {
  //     var avg = (data[i] + data[i +1] + data[i +2]) / 3;
  //     avg > settings["threshold"] ? avg = 255 : avg = 0;
  //     data[i]     = avg; // red
  //     data[i + 1] = avg; // green
  //     data[i + 2] = avg; // blue
  //   }
  //   ctx.putImageData(imageData, 0, 0);
  // }

  // Use the vertically oriented list to draw the image
  function listToImageVertical(list, canvas){

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var index = 0;

    var page = 0;
    var x = 0;
    var y = 7;

    // Move the list into the imageData object
    for (var i=0;i<list.length;i++){

      var binString = hexToBinary(list[i]);
      if(!binString.valid){
        alert("Something went wrong converting the string. Did you forget to remove any comments from the input?");
        console.log("invalid hexToBinary: ", binString.s);
        return;
      }
      binString = binString.result;
      if (binString.length == 4){
        binString = binString + "0000";
      }

      // Check if pixel is white or black
      for(var k=0; k<binString.length; k++){
        var color = 0;
        if(binString.charAt(k) == "1"){
          color = 255;
        }
        drawPixel(ctx, x, (page*8)+y, color);
        y--;
        if(y < 0){
          y = 7;
          x++;
          if(x >= settings["screenWidth"]){
            x = 0;
            page++;
          }
        }

      }
    }
    // Save the canvas contents inside the img object. This way we can
    // reuse the img object when we want to scale / invert, etc.
    var img = new Image();
    img.src = canvas.toDataURL("image/png");
    images.first().img = img;
  }

  // Convert hex to binary
  function hexToBinary(s) {

    var i, k, part, ret = "";
    // lookup table for easier conversion. "0" characters are
    // padded for "1" to "7"
    var lookupTable = {
      "0": "0000", "1": "0001", "2": "0010", "3": "0011", "4": "0100",
      "5": "0101", "6": "0110", "7": "0111", "8": "1000", "9": "1001",
      "a": "1010", "b": "1011", "c": "1100", "d": "1101", "e": "1110",
      "f": "1111", "A": "1010", "B": "1011", "C": "1100", "D": "1101",
      "E": "1110", "F": "1111"
    };
    for (i = 0; i < s.length; i += 1) {
      if (lookupTable.hasOwnProperty(s[i])) {
        ret += lookupTable[s[i]];
      } else {
        return { valid: false, s: s };
      }
    }
    return { valid: true, result: ret };
  }

  // Quick and effective way to draw single pixels onto the canvas
  // using a global 1x1px large canvas
  function drawPixel(ctx, x, y, color) {
    var single_pixel = ctx.createImageData(1,1);
    var d = single_pixel.data;

    d[0] = color;
    d[1] = color;
    d[2] = color;
    d[3] = 255;
    ctx.putImageData(single_pixel, x, y);
  }

  document.getElementById("outputFormat").value = "arduino";
  document.getElementById("outputFormat").onchange();

};
