import { Client } from "@xhayper/discord-rpc";
import { ipcMain } from "electron";

const YT_API_KEY = "AIzaSyBaUEQ9dnGj3XVMpqZOVn5H6A66JtKfsJ8";

function youtubeParser(url): string {
	const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	const match = url.match(regExp);
	return (match && match[7].length == 11) ? match[7] : false;
}


export async function createDiscordClient(this: any, clientId: string) {
	const client = new Client({
		clientId
	});

	client.login();

	// client.on("ready", () => {
	//   client.user?.setActivity({
	//     details: "Browsing",
	//     smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
	//   })
	// })

	let disabled = false;


	const setBrowsing = () => {
		if (disabled) return;
		client.user?.setActivity({
			details: "Browsing",
			smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
		})
	};

	const disable = () => {
		client.user?.clearActivity();
		disabled = true;
	}
	const enable = () => {
		disabled = false;
	}

	return {
		setBrowsing,
		setVideo: async (vidUrl: string) => {
			if (disabled || !client.isConnected) return;
			const vidid = await youtubeParser(vidUrl);
			if (!vidid) { setBrowsing(); return }
			const dataRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vidid}&key=${YT_API_KEY}`);
			const dataJSON = await dataRes.json();
			const data = (await dataJSON.items[0]).snippet;
			client.user?.setActivity({
				type: 3, // Watching...
				details: data.title,
				state: data.channelTitle,
				largeImageKey: data.thumbnails.high.url,
				smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
				buttons: [
					{
						label: "Watch on YouTube",
						url: "https://youtu.be/" + vidid
					}
				]
			})
		},
		setMusic: async (data) => {
			if (disabled || !client.isConnected) return;
			if (!data) { setBrowsing(); return; }
			client.user?.setActivity({
				type: 2, // Listening...
				details: data.title,
				state: data.author,
				largeImageKey: data.thumbnail.thumbnails[3].url,
				smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/1024px-Youtube_Music_icon.svg.png?20230802004652",
				buttons: [
					{
						label: "Listen on YT Music",
						url: "https://music.youtube.com/watch?v=" + data.id
					}
				]
			})
		},
		enable,
		disable,
		toggle: () => {
			if (disabled) enable();
			else disable();
		}
	}
}


