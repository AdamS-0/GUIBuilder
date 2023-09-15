function downloadContent(content, fileName) {
	const link = document.createElement("a");
	const file = new Blob([content], { type: 'text/plain' });
	link.href = URL.createObjectURL(file);
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(link.href);
}


function proj_new() {
	if(screens.length > 0) screens = [];
	Screen.screenNum = 0;
	addNewScreen("");
	loadScreensList();
	showProps(screens[selectedScreen]);
}



function JSONReplacer(key,value) {
	if (key=="ParentScreen") return undefined;
	else return value;
}


function proj_save() {
	var elProjectName = document.getElementById("projectName");
	if( elProjectName.value.length <= 0) elProjectName.value = "project";
	var toExport = [resources, screens, saveSettings()];
	var projectJSON = JSON.stringify(toExport, JSONReplacer);
	downloadContent(projectJSON, elProjectName.value + ".guibldr");
}


function proj_open(inputElement) {
	inputElement.showPicker();
}


function loadProject(inputElement) {
	var fIn = inputElement;
	var file = fIn.files[0];
	var reader = new FileReader();
	
	reader.onloadend = function(e) {
		loadFromJSON( e.target.result );
		inputElement.value = '';
		if(e.target.error){
			alert(e.target.error.code);
		}
	};
	reader.readAsText(file);
}

function loadFromJSON(jsonStr) {
	var fromImport = JSON.parse( jsonStr );
	var resourcesIn = fromImport[0];
	var screensIn = fromImport[1];
	loadSettings(fromImport[2]);

	for( var i = 0; i < resourcesIn.length; i++ ) {
		var rsc = createResourceByCopy( resourcesIn[i] )
		while( resources.findIndex( rsIn => rsIn.Name == rsc.Name ) >= 0 ) {
			rsc.Name += "1";
		}
		resources.push( rsc );
	}

	for( var i = 0; i < screensIn.length; i++ ) {
		var scr = createScreenByCopy( screensIn[i] );
		while( screens.findIndex( s => s.Name == scr.Name ) >= 0 ) scr.Name += "1";
		screens.push( scr );
	}
	
	selectedScreen = screens.length - 1;
	loadScreensList();
	selectedScreenChanged();
}




function createScreenByCopy( scr2copy ) {
	var scr = new Screen();
	
	for( var key in scr2copy ) {
		if( key != "Controls" ) scr[key] = scr2copy[key];
	}
	
	var i = 0;
	var clIn;
	for(; i < scr2copy.Controls.length; i++) {
		clIn = scr2copy.Controls[i];
		var cl = createControlByType(clIn["Type"]);
		scr.Controls.push( cl );
		for( var key in clIn ) {
			cl[key] = clIn[key];
		}
		cl.ParentScreen = scr;
	}
	
	
	return scr;
}




function createResourceByCopy( rsc2copy ) {
	var rsc = null;

	if( rsc2copy.Type == ResourceType.String ) rsc = new RString(rsc2copy.Name, rsc2copy.Value);
	else if( rsc2copy.Type == ResourceType.Bitmap ) rsc = new RBitmap(rsc2copy.Name, rsc2copy.Source);
	
	return rsc;
}


















function saveSettings() {
	var scaleK = document.getElementById("scale").value;
	var className = document.getElementById("className").value;
	var showBBoxes = document.getElementById("showBoundingBoxes").checked;
	var projName = document.getElementById("projectName").value;

	return {
		scale : scaleK,
		displayInstance : className,
		showBoundingBoxes : showBBoxes,
		projectName : projName
	};
}

function loadSettings(settings) {
	if( settings == null ) return;
	document.getElementById("scale").value = settings.scale;
	document.getElementById("className").value = settings.displayInstance;
	document.getElementById("showBoundingBoxes").checked = settings.showBoundingBoxes;
	document.getElementById("projectName").value = settings.projectName;
}