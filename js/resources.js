

const ResourceType = {
	Null: "Empty",
	String: "String",
	Bitmap: "Bitmap"
}




class Resource{
	Name = "";
	Value = null;

	Type = ResourceType.Null;
	static rNum = 0;
	
	constructor(name = "", value = null) {
		if ( name.length == 0 ) name = "resource" + Resource.resourcesNum++;
		
		this.Name = name;
		this.Value = value;
	}

	requiredRefresh() {
		showResources();
	}

	showResource(row = null) {
		if(row == null) return null;

		var _this = this;

		row = insertProperty( row, "input", [
			"type", "text",
			"value", this.Name,
			"onChange", function(e){ _this.Name = e.target.value; }
		]);
		
		return row;
	}

	generateCode(className = "tft", oneColor = 0) {
		return "";
	}

}



class RString extends Resource {
	static rNum = 0;
	Type = ResourceType.String;
	constructor(name = "", value = "value") {
		if( name.length == 0) name = "string" + RString.rNum++;
		super(name, value);
	}

	showResource(row = null) {
		if(row == null) return null;
		
		super.showResource(row);
		
		var _this = this;
		
		row = insertProperty( row, "input", [
			"type", "text",
			"value", this.Value,
			"onChange", function(e){ _this.Value = e.target.value; }
		]);

		return row;
	}

	generateCode(className = "tft", oneColor = 0) {
		var strCode = "";
		strCode += "const String " + this.Name + " = \"" + this.Value + "\";\n";
		return strCode;
	}
}


class RBitmap extends Resource {
	static rNum = 0;
	Source = "";
	CodeRGB = "";
	CodeBW = "";
	Width = 0;
	Height = 0;
	Bmp = null;
	BmpBinary = null;
	Type = ResourceType.Bitmap;
	constructor(name = "", source = "") {
		if( name.length == 0) name = "bitmap" + RBitmap.rNum++;
		super(name, "");
		this.Source = source;
		if( this.Source.length > 0 ) this.recalculate();
	}



	recalculate() {
		this.CodeRGB = "";
		this.CodeBW = "";

		this.Bmp = new Image_Bitmap();
		this.Bmp.load(this, this.Source, this.recalculateAfterLoad);
	}

	recalculateAfterLoad(_this) {
		_this.Width = _this.Bmp.Width;
		_this.Height = _this.Bmp.Height;

		for(var j = 0; j < _this.Height; j++) {
			for(var i = 0; i < _this.Width; i++) {
				var c = _this.Bmp.getPixel(i, j);
				c.a = 255;
				_this.Bmp.setPixel( i, j, c);
			}
		}

		_this.BmpBinary = new Image_BitmapBinary(_this.Bmp);

		// black-white bitmap
		var colorByte = "";
		for(var j = 0; j < _this.Height; j++) {
			_this.CodeBW += "\t";
			for(var i = 0; i < _this.Width; i++) {
				var color = _this.Bmp.getPixel(i, j);
				var binCol = RGB2binaryColor(color);
				
				colorByte += binCol;
				if( colorByte.length >= 8 ) {
					_this.CodeBW += value2hex(colorByte);
					if( j < _this.Height - 1 || ( j == _this.Height - 1 && i < _this.Width - 1 ) )
						_this.CodeBW += ", ";
					colorByte = "";
				}
			}

			if( colorByte.length > 0 ) {
				while( colorByte.length < 8 ) colorByte += "0";
				_this.CodeBW += value2hex(colorByte, 2, 2);
				if( j < _this.Height - 1 || ( j == _this.Height - 1 && i < _this.Width - 1 ) )
					_this.CodeBW += ", ";
				colorByte = "";
			}

			if( j < _this.Height - 1 ) _this.CodeBW += "\n";
		}


		// RGB 565 bitmap
		for(var j = 0; j < _this.Height; j++) {
			_this.CodeRGB += "\t";
			for(var i = 0; i < _this.Width; i++) {
				var color = RGB2565( _this.Bmp.getPixel(i, j) );
				_this.CodeRGB += value2hex(color, 4, 10);
				if( j < _this.Height - 1 || ( j == _this.Height - 1 && i < _this.Width - 1 ) )
					_this.CodeRGB += ", ";
			}

			if( j < _this.Height - 1 ) _this.CodeRGB += "\n";
		}

		refreshCurrentScreen();
	}


	showResource(row = null) {
		if(row == null) return null;
		
		super.showResource(row);
		
		var _this = this;
		
		row = insertProperty( row, "img", [
			"src", this.Source,
			"style", "height: 50px;",
			"onChange", function(e){ _this.Source = e.target.value; }
		]);

		var _this = this;
		row = insertProperty( row, "input", [
			"type", "text",
			"value", this.Source,
			"onChange", function(e){ _this.Source = e.target.value; },
			"onpaste", function(event){
				var items = (event.clipboardData || event.originalEvent.clipboardData).items;
				for (var index in items) {
					var item = items[index];
					if (item.kind === 'file') {
						var blob = item.getAsFile();
						var reader = new FileReader();
						reader.onload = function(event) {
							_this.Source = event.target.result;
							_this.recalculate();
							_this.requiredRefresh();
						};
						reader.readAsDataURL(blob);
					}
				}
			},
			"ondblclick", function() {
				console.log(_this);
				resourceBitmapToLoad = this;
				document.getElementById("imageIn").showPicker();
			}
		]);

		return row;
	}


	generateCode(className = "tft", oneColor = 0) {
		var ctrls = screens.find(scr => scr.Controls.find( ctrl => ctrl.Image == this.Name ));

		if(ctrls == null) return "";

		var strCode = "";
		
		var ctrlsRGB565 = screens.find(scr => scr.Controls.find( ctrl => ctrl.Image == this.Name && ctrl.ColorModel == EnumColorModel.RGB565 ));

		var ctrlsOneColor = screens.find(scr => scr.Controls.find( ctrl => ctrl.Image == this.Name && ctrl.ColorModel == EnumColorModel.OneColor ));

		
		if(ctrlsRGB565 != null) {
			strCode += "// image: " + this.Name + ", size: " + this.Width + "x" + this.Height + " in rgb 565 format\n";
			strCode += "const uint16_t " + this.Name + "_RGB565 [] PROGMEM = {\n" + this.CodeRGB + "\n};\n";
		}

		if(ctrlsOneColor != null) {
			strCode += "// image: " + this.Name + ", size: " + this.Width + "x" + this.Height + " one color\n";
			strCode += "const unsigned char " + this.Name + "_bw [] PROGMEM = {\n" + this.CodeBW + "\n};\n";
		}
		return strCode;
	}

}




function getImageDataFromURI(source, senderParent, sender, callback) {
	var myCanvas = document.createElement("canvas");
	var ctx = myCanvas.getContext('2d');
	var img = new Image;
	img.crossOrigin = "anonymous";
	img.src = source;
	img.onload = function() {
		ctx.drawImage(img,0,0);
		callback( senderParent, sender, ctx.getImageData(0, 0, img.width, img.height) );
	}
}


// images have to be loaded as async (cannot force load event!),
// this is a reason for sender and senderParent this-o-references
class Image_Bitmap {
	_image = null;
	_bmp = null;

	_parentAfterLoad = null;

	Width = 0;
	Height = 0;
	constructor(){}

	load(sender, src, parentAfterLoad) {
		this._parentAfterLoad = parentAfterLoad;
		getImageDataFromURI(src, sender, this, this.afterLoad);
	}

	afterLoad(senderParent, _this, imgData) {
		_this._bmp = imgData.data;
		_this.Width = imgData.width;
		_this.Height = imgData.height;
		if(_this._parentAfterLoad != null) _this._parentAfterLoad(senderParent);
	}

	setPixel(x, y, color) {
		if( x < 0 || x >= this.Width || y < 0 || y >= this.Height ) return;
		var index = 4 * (parseInt(this.Width) * parseInt(y) + parseInt(x));
		this._bmp[index + 0] = color.r;
		this._bmp[index + 1] = color.g;
		this._bmp[index + 2] = color.b;
	}

	getPixel(x, y) {
		if( x < 0 || x >= this.Width || y < 0 || y >= this.Height ) return;
		var index = 4 * (parseInt(this.Width) * parseInt(y) + parseInt(x));
		return {
			r: this._bmp[index + 0],
			g: this._bmp[index + 1],
			b: this._bmp[index + 2],
			a: this._bmp[index + 3]
		};
	}
}




class Image_BitmapBinary {
	_image = null;
	_bmp = null;
	Width = 0;
	Height = 0;

	constructor(imgRGB) {
		
		this.Width = imgRGB.Width;
		this.Height = imgRGB.Height;
		this._bmp = new Array(this.Width * this.Height);

		for( var y = 0; y < this.Height; y++) {
			for( var x = 0; x < this.Width; x++) {
				var c = imgRGB.getPixel(x, y);
				c = RGB2binaryColor(c);
				this.setPixel(x, y, c);
			}	
		}
	}

	setPixel(x, y, color) {
		if( x < 0 || x >= this.Width || y < 0 || y >= this.Height ) return;
		var index = (parseInt(this.Width) * parseInt(y) + parseInt(x));
		this._bmp[index] = color;
	}

	getPixel(x, y) {
		if( x < 0 || x >= this.Width || y < 0 || y >= this.Height ) return;
		var index = (parseInt(this.Width) * parseInt(y) + parseInt(x));
		return this._bmp[index];
	}
}



function convertURIToImageData(URI) {
	return new Promise(function(resolve, reject) {
		if (URI == null) return reject();
		var canvas = document.createElement('canvas'),
		context = canvas.getContext('2d'),
		image = new Image();
		image.addEventListener('load', function() {
			canvas.width = image.width;
			canvas.height = image.height;
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			resolve(context.getImageData(0, 0, canvas.width, canvas.height));
		}, false);
		image.src = URI;
	});
}








function loadImage() {
	if(resourceBitmapToLoad == null) return;
}





var resourceBitmapToLoad = null;

var resources = new Array();


// resources.push( new RString("", "Test1") );
// resources.push( new RBitmap("", "") );



function showResources() {
	var tabResources = document.getElementById("pResources");
	
	var tab = document.createElement("table");
	tab.style.display = "block";
	
	tabResources.innerHTML = "";
	
	resources.forEach(res => {
		var row = tab.insertRow(-1);
		row = insertProperty( row, "button", [
			"innerHTML", "Remove",
			"onclick", function() { removeResource(res); showTabResources(); }
		]);
		res.showResource(row);
	});

	tabResources.appendChild(tab);

	var btnAddString = document.createElement("button");
	// btnAddString.style.display="inline-block";
	btnAddString.innerHTML = "Add String";
	btnAddString.onclick = function() {
		resources.push( new RString("", "Text") ); showTabResources();
	};
	tabResources.appendChild(btnAddString);

	var btnAddImage = document.createElement("button");
	// btnAddString.style.display="inline-block";
	btnAddImage.innerHTML = "Add Image";
	btnAddImage.onclick = function() {
		resources.push( new RBitmap() );
		showTabResources();
	};
	tabResources.appendChild(btnAddImage);
}





function insertProperty( row, tag, params ) {
	var c1 = row.insertCell(-1); c1.style.display="inline-block";
	var elemInput;
	elemInput = document.createElement(tag);
	
	for( var i = 0; i < params.length; i += 2 ) {
		if( params[i].toLowerCase() == "onchange" ) {
			elemInput.onchange = params[i + 1];
		} else if( params[i].toLowerCase() == "onclick" ) {
			elemInput.onclick = params[i + 1];
		} else {
			try{ elemInput[ params[i] ] = params[i + 1]; } catch {}
		}
	}
	
	c1.appendChild(elemInput);
	return row;
}






function addNewResource() {

}


function removeResource(res) {
	if (res == null) return;
	
	var resourceId = resources.indexOf(res);

	if( resourceId > -1 && resourceId < resources.length ) {
		resources.splice(resourceId, 1); // 2nd parameter means remove one item only
	}
}




