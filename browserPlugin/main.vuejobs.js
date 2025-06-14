const ParentCard = ".transition-all";
const LastCompany = "Kleer and Membersy";
let found = false;

function docReady(fn) {
	// see if DOM is already available
	if (document.readyState === "complete" || document.readyState === "interactive") {
		// call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

docReady(() => {
	document.querySelectorAll('.flex.items-center.text-sm.font-medium.text-muted').forEach((el) => {
		if (el.innerText.includes(LastCompany)) {
			found = true;
		}
		if (found) {
			el.closest(ParentCard).remove();
		}
	});
});
