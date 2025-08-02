var colorFLast = 0;
var colorBGLast = 0;
var textSizeLast = 0;

function codeGen_resetSetters() {
	colorFLast = -1;
	colorBGLast = -1;
	textSizeLast = -1;
}


function generateCode() {
	var strCode = "";
	
	var className = document.getElementById("className").value;
	
	codeGen_resetSetters();
	for( var i = 0; i < resources.length; i++ ) {
		strCode += resources[i].generateCode(className);
	}

	codeGen_resetSetters();
    if( Menu.cnum > 0 ) {
        strCode += Menu.generateFunctionToDraw(className);
    }

	for( var i = 0; i < screens.length; i++ ) {
		codeGen_resetSetters();
		strCode += screens[i].generateCode(className);
	}
	
	// downloadContent(strCode, "project.c");
	var codePanel = document.getElementById("pCode");
	codePanel.value = strCode;
	showTabCode();
}


function codeDrawLine(className, x0, y0, x1, y1, lineColor) {
	return "\t" + className + ".drawLine(" + x0 + ", " + y0 + "," + x1 + ", " + y1 + ", " + lineColor + ");\n";
}

function codeSetTextColor(className, colorF, colorBG, force = false) {
	if( (colorFLast == colorF) && (colorBGLast == colorBG) && !force ) { return ""; }
	colorFLast = colorF;
	colorBGLast = colorBG;
	return "\t" + className + ".setTextColor(" + colorF + ", " + colorBG + ");\n";
}

function codeSetTextSize(className, si, force = false) {
	if( (textSizeLast == si) && !force ) { return ""; }
	textSizeLast = si;
	return "\t" + className + ".setTextSize(" + si + ");\n";
}

function codeSetCursor(className, x, y) {
	return "\t" + className + ".setCursor(" + x + ", " + y + ");\n";
}


function codePrint(className, msg) {
	return "\t" + className + ".print(" + msg + ");\n";
}


function codeDrawRect(className, x, y, w, h, color) {
	return "\t" + className + ".drawRect(" + x + ", " + y + ", " + w + ", " + h + ", " + color + ");\n"; 
}

function codeDrawRoundRect(className, x, y, w, h, r, color) {
	return "\t" + className + ".drawRoundRect(" + x + ", " + y + ", " + w + ", " + h + ", " + r + ", " + color + ");\n"; 
}


function codeFillRect(className, x, y, w, h, color) {
	return "\t" + className + ".fillRect(" + x + ", " + y + ", " + w + ", " + h + ", " + color + ");\n"; 
}

function codeFillRoundRect(className, x, y, w, h, r, color) {
	return "\t" + className + ".fillRoundRect(" + x + ", " + y + ", " + w + ", " + h + ", " + r + ", " + color + ");\n"; 
}




function codeDrawCircle(className, x, y, r, color) {
	return "\t" + className + ".drawCircle(" + x + ", " + y + ", " + r + ", " + color + ");\n"; 
}

function codeFillCircle(className, x, y, r, color) {
	return "\t" + className + ".fillCircle(" + x + ", " + y + ", " + r + ", " + color + ");\n"; 
}



function codeDrawBitmap(className, x, y, bitmap_name, w, h, color) {
	return "\t" + className + ".drawBitmap(" + x + ", " + y + ", " + bitmap_name + ", " + w + ", " + h + ", " + color + ");\n";
}

function codeDrawRGBBitmap(className, x, y, bitmap_name, w, h) {
	return "\t" + className + ".drawRGBBitmap(" + x + ", " + y + ", " + bitmap_name + ", " + w + ", " + h + ");\n";
}	

