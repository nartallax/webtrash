let selectionFreezeLevel = 0;
let savedSelectionRanges: Range[] | null = null;
let userSelectValue: string = "";

export function freezeTextSelection(){
	selectionFreezeLevel++;
	if(selectionFreezeLevel === 1){
		doFreeze();
	}
}

export function unfreezeTextSelection(){
	selectionFreezeLevel--;
	if(selectionFreezeLevel === 0){
		doUnfreeze();
	}
}




function doFreeze(){
	storeAndClearCurrentSelection();
	storeAndClearUserSelectValue();
}

function storeAndClearCurrentSelection(){
	let sel = window.getSelection();
	if(!sel){
		savedSelectionRanges = null;
	} else {
		savedSelectionRanges = [];
		for(let i = 0; i < sel.rangeCount; i++){
			savedSelectionRanges.push(sel.getRangeAt(i));
		}
		sel.removeAllRanges();
	}
}

function storeAndClearUserSelectValue(){
	userSelectValue = document.body.style.userSelect;
	document.body.style.userSelect = "none";
}




function doUnfreeze(){
	restoreSavedSelection();
	restoreUserSelectValue();
}

function restoreSavedSelection(){
	let sel = window.getSelection();
	if(sel){
		sel.removeAllRanges();
		if(savedSelectionRanges){
			for(let range of savedSelectionRanges){
				sel.addRange(range)
			}
		}
		
	}
}

function restoreUserSelectValue(){
	document.body.style.userSelect = userSelectValue;
}