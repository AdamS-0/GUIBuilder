function generateCode() {
	var strCode = "";
	
	var className = document.getElementById("className").value;
	for( var i = 0; i < screens.length; i++ ) {
		strCode += screens[i].generateCode(className);
	}
	
	// downloadContent(strCode, "project.c");
	var codePanel = document.getElementById("txtCode");
	codePanel.textContent = strCode;
	showCode();
}




function codeDrawLine(className, x0, y0, x1, y1, lineColor) {
	return "\t" + className + ".drawLine(" + x0 + ", " + y0 + "," + x1 + ", " + y1 + ", " + lineColor + ");\n";
}


function codeSetTextColor(className, colorF, colorBG) {
	return "\t" + className + ".setTextColor(" + colorF + ", " + colorBG + ");\n";
}

function codeSetTextSize(className, si) {
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






