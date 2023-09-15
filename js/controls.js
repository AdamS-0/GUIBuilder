function createRow(sender, tab, propType, propertyName, propertyValue, comboOptions = []) {
	var row = tab.insertRow(-1);
	var c0 = row.insertCell(0);	var c1 = row.insertCell(1);
	var elemInput;
	c1.style.display="inline-block";

	if( propType == "combobox" ) {
		elemInput = document.createElement("select");
		for( var i = 0; i < comboOptions.length; i++ ){
			var optEl = document.createElement("option");
			optEl.value = comboOptions[i];
			optEl.text = comboOptions[i];
			elemInput.appendChild(optEl);
			if( propertyValue == comboOptions[i] ) optEl.selected = true;
		}
	} else {
		elemInput = document.createElement("input"); elemInput.type = propType; elemInput.value = propertyValue;
		if( propType == "number" ) elemInput.min = 0;
		if( propType == "checkbox" ) elemInput.checked = propertyValue;
		
	}

	c0.innerHTML = propertyName;
	elemInput.style.maxWidth = "100px";
	elemInput.onchange = function(e){
		if( propType == "checkbox" )	sender[propertyName] = 0 + e.target.checked;
		else 							sender[propertyName] = e.target.value;
		sender.requiredRefresh();
	};
	c1.appendChild(elemInput);

}

function addRowButton(senderScreen, senderControl, tab, text, onclick) {
	var row = tab.insertRow(-1);
	var c0 = row.insertCell(0);
	c0.colSpan = 2;
	var btn = document.createElement("button");
	btn.innerHTML = text;
	btn.onclick = onclick;
	c0.appendChild(btn);
}


function getRsqr(x0, y0, x1, y1) {
	xo = Number(x0); 	y0 = Number(y0);	x1 = Number(x1);	y1 = Number(y1);
	return Math.pow( x0 - x1, 2 ) + Math.pow(y0 - y1, 2);
}

function isBetween(v, a, b) {
	a = parseFloat(a);	b = parseFloat(b);
	var min = Math.min(a, b);
	var max = Math.max(a, b);
	return v >= a && v <= b;
}


function screenItemClick(e) {
	scrName = e.target.name;
	
	scr = screens.find( s => s.Name == scrName );
	selectedScreen = screens.indexOf(scr);
	loadScreensList();
	showProps(scr);
	
	selectedControl = null;
	addToSelectedControls(scr, null);
	refreshCurrentScreen();
}

function screenItemDoubleClick(e) {
	scrName = e.target.name;
	
	scr = screens.find( s => s.Name == scrName );
	scr.showControlsAtList = !scr.showControlsAtList;
	//selectedScreen = screens.indexOf(scr);
	loadScreensList();
	// showProps(scr);
	// selectedControl = null;
}



function controlItemClick(e) {
	scrName = e.target.scrName;
	controlName = e.target.name;
	
	scr = screens.find( s => s.Name == scrName );
	
	var ctrl = scr.Controls.find( ci => ci.Name == controlName );
	
	showProps(scr, ctrl);
	selectedControl = ctrl;
	addToSelectedControls(scr, ctrl);
	refreshCurrentScreen();
}


function addToSelectedControls(scr, ctrl) {
	if( scr == null ) return;
	
	if( !shiftPressed )	scr.Controls.forEach(control => { control.Selected = false; });
	if( ctrl != null ) 	ctrl.Selected = !ctrl.Selected;
}


function showProps(scr, ctrl) {
	var tabProps = document.getElementById("tabProperties");
	var spn = document.getElementById("propSender");
	
	var tab = document.createElement("table");
	tab.style.display = "block";
	tab.style.maxWidth = "230px";

	if( scr == null ) scr = screens[selectedScreen];

	if(ctrl == null) {
		tab = scr.showProperties(tabProps, tab);
		spn.innerHTML = " - " + scr.Name;
		
		selectedScreenChanged();
		return;
	}
	
	tab = ctrl.showProperties(tabProps, tab);
	spn.innerHTML = " - " + scr.Name + " > " + ctrl.Name;
	
	addRowButton(scr, ctrl, tab, "Delete", function(){ deleteControl(scr, ctrl); });
	addRowButton(scr, ctrl, tab, "To Back", function(){ sendControlToBack(scr, ctrl); });
	addRowButton(scr, ctrl, tab, "To Front", function(){ bringControlToFront(scr, ctrl); });
}


// [ "Label", "Line", "HLine", "VLine", "Rectangle", "Shape" ];


const Directions = {
	Left2Right: "Left to right",
	Righ2Left: "Right to left",
	Top2Bottom: "Top to bottom",
	Bottom2Top: "Bottom to top"
}





function checkCursorOnBoundingModifier(x, y, x0, y0, R = 2) {
	var R0 = Math.abs( getRsqr(x, y, x0, y0) );
	
	if (R0 < R) return true;

	return false;
}


function checkCursorOnLine(x, y, x0, y0, x1, y1, R = 2) {
	var dX = x1 - x0;	var dY = y1 - y0; // delta XY of line
	var cdX = x - x0;	var cdY = y - y0; // delta XY of cursor
	
	var R0 = Math.abs( getRsqr(x, y, x0, y0) );
	R0 = Math.abs( Math.sqrt( R0 ) ); // radius: cursor <-> (X, Y)
	var RLine = Math.abs( Math.sqrt( getRsqr(x0, y0, x1, y1) ) ); // line length
	var alphaL = Math.atan2( dY, dX ); // alpha line
	var alphaC = Math.atan2( cdY, cdX ); // alpha cursor
	var alpha = -alphaL + alphaC;
	var c2x = R0 * Math.cos( alpha );
	
	if( !isBetween(c2x, 0, RLine) ) return Number.MAX_VALUE;
	
	var c2y = R0 * Math.sin( alpha );
	return Math.abs( c2y );
	
	// return false;
}