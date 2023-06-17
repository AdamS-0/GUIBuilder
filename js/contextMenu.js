function hideContextMenu(ctxMenu) {
	ctxMenu.className = "hide";
}

function showContextMenuEditor(event) {
	event.preventDefault();
	var ctxMenuEditor = document.getElementById("contextMenuEditor");
	ctxMenuEditor.className = "show";

	ctxMenuEditor.style.left = event.pageX + 'px';
    ctxMenuEditor.style.top = event.pageY + 'px';
}



function contextMenuTreeScreens(event) {
	event.preventDefault();
	var ctxMenu = document.getElementById("contextMenuTreeScreens");
	ctxMenu.className = "show";

	ctxMenu.style.left = event.pageX + 'px';
    ctxMenu.style.top = event.pageY + 'px';
}


function contextMenuTreeControls(event) {
	event.preventDefault();
	var ctxMenu = document.getElementById("contextMenuEditor");
	ctxMenu.className = "show";

	ctxMenu.style.left = event.pageX + 'px';
    ctxMenu.style.top = event.pageY + 'px';
}