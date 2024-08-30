import { app } from "electron";
import https from "https"; // or 'https' for https:// URLs
import { join } from "path";
import fs from "fs";

export function downloadCss(url: string) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(
      join(app.getPath("appData"), "music.css"),
    );
    https.get(url, function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        resolve(true);
      });
    });
  });
}

// export function loadCss(): any {
//   fs.readFile(join(app.getPath("appData"), "music.css"), "utf-8", (err, data) => {
//     if (!err && data) {
//       console.log(data);
//       return data.toString();
//     } else {
//       return "";
//     }
//   });
// }

// export const loadCss = new Promise<string>((resolve) => {
//   fs.readFile(
//     join(app.getPath("appData"), "music.css"),
//     "utf-8",
//     (err, data) => {
//       if (!err && data) {
//         resolve(data);
//       } else {
//         resolve("");
//       }
//     },
//   );
// });

export function loadCss(url:string) {
  return new Promise<string>((resolve) => {
    if(url==="") {
      resolve("");
      return;
    }
    https.get(url, res => {
      let data = ''
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    
      // @ts-ignore
      res.on('data', (chunk:any) => {
        data += chunk;
      });
    
      res.on('end', () => {
        resolve(data)
      });
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
  }
)
  
}
