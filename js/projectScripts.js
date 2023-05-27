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
	var projectJSON = JSON.stringify(screens, JSONReplacer);
	downloadContent(projectJSON, "project.guibldr");
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
	screensIn = JSON.parse( jsonStr );
	
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