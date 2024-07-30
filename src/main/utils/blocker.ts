import { ElectronBlocker } from "@cliqz/adblocker-electron";

export async function createBlocker() {
	const blocker = await ElectronBlocker.fromLists(fetch, [
		"https://easylist.to/easylist/easylist.txt",
		'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2024.txt',
		'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/quick-fixes.txt'
	]);

	return blocker;
}