import fs from "fs";
import path from "path";
import {USER_PATH} from "./config";
import readline, {Interface} from "readline";

export const FileUtil = {

  readJSON: function<T>(filePath : string) : T {
    let data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T
  },


  // getStream: function (filePath) {
  //   return {"CUSTOM": [{date: "CUSTOM", processed:  false, size: sizes[date]}]}
  // },


  getUsers: function() : {[userName: string] : any } {
    let items = FileUtil.getDirectoryPaths(USER_PATH)

    let sizeCutoff = 300;
    let result : {[userName: string] : any } = {}
    for (let userPath of items) {
      let user = path.basename(userPath)
      let dates = FileUtil.getDates(userPath);
      let sizes = FileUtil.getSizes(userPath);

      let content = [];
      for (let date of dates) {
        if (sizes[date] > sizeCutoff) {
          let parts = Math.ceil(sizes[date]/sizeCutoff);
          for (let i = 0; i < parts - 1; i++) {
            content.push({date: date, processed: FileUtil.doesProcessedFileExist(user, date, i) || false, size: sizeCutoff, part: i, parts});
          }
          content.push({date: date, processed: FileUtil.doesProcessedFileExist(user, date, parts-1) || false, size: sizes[date] - (parts-1)*sizeCutoff, part: parts-1, parts});
        }
        else {
          content.push({date: date, processed: FileUtil.doesProcessedFileExist(user, date, null) || false, size: sizes[date]});
        }
      }

      result[user] = content;
    }
    return result;
  },


  getDirectories: function(inPath) : string[] {
    if (fs.existsSync(inPath) === false) {
      fs.mkdirSync(inPath);
    }

    let items =  fs.readdirSync(inPath);
    let result : string[] = [];
    for (let item of items) {
      let usedPath = path.join(inPath, item)
      if (fs.statSync(usedPath).isDirectory()) {
        result.push(item)
      }
    }
    return result;
  },


  getJSONFilePaths: function(inPath) : string[] {
    let items =  fs.readdirSync(inPath);
    let result : string[] = [];
    for (let item of items) {
      let usedPath = path.join(inPath, item)
      if (fs.statSync(usedPath).isDirectory() === false && path.extname(usedPath) === '.json') {
        result.push(usedPath)
      }
    }
    return result;
  },


  getDates: function(inPath) : string[] {
    let items = fs.readdirSync(inPath);
    let result : string[] = [];
    for (let item of items) {
      if (item.indexOf("CrownstoneAppLog") !== -1) {
        result.push(item.substr(16,10))
      }
    }
    return result;
  },


  getSizes: function(inPath) : Record<string, number> {
    let items = fs.readdirSync(inPath);
    let result : Record<string, number> = {};
    for (let item of items) {
      if (item.indexOf("CrownstoneAppLog") !== -1) {
        let stat = fs.statSync(path.join(inPath, item));
        let date = item.substr(16,10);
        result[date] = Math.round(stat.size / 1024 / 1024)
      }
    }
    return result;
  },



  doesProcessedFileExist: function(user, date, part) : boolean {
    let filePath;
    if (part === null) {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}.log`);
    }
    else {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}_p${part}.log`);
    }

    return FileUtil.fileExists(filePath);
  },


  removeProcessedData(user,date, part = null) {
    let filePath;
    if (part === null) {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}.log`);
    }
    else {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}_p${part}.log`);
    }

    return fs.rmSync(filePath);
  },


  getFileContents(user, date) : string {
    let filePath = path.join(USER_PATH, user, `CrownstoneAppLog${date}.log`);
    return fs.readFileSync(filePath,'utf-8')
  },


  getFilePath(user,date) : string {
    return path.join(USER_PATH, user, `CrownstoneAppLog${date}.log`);
  },

  getUserDateFileStream(user, date) : Interface {
    let filePath = FileUtil.getFilePath(user,date);
    return FileUtil.getFileStream(filePath)
  },

  getFileStream(filePath) {
    const file = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout,
      terminal: false
    });
    return file;
  },


  getProcessedData(user, date, part = null) {
    let filePath;
    if (part === null) {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}.log`);
    }
    else {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}_p${part}.log`);
    }

    if (FileUtil.fileExists(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
  },


  storeProcessedData(user, date, data, part = null) {
    let filePath;
    if (part === null) {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}.log`);
    }
    else {
      filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}_p${part}.log`);
    }

    FileUtil.ensurePath(path.join(USER_PATH, user, 'processed'));
    let stringBuffer = JSON.stringify(data,null,2);
    console.log('stringBuffer.length',stringBuffer.length)
    fs.writeFileSync(filePath, stringBuffer);
  },


  getDirectoryPaths: function(inPath) : string[] {
    let items = FileUtil.getDirectories(inPath);
    let result : string[] = [];
    for (let item of items) {
      let usedPath = path.join(inPath, item)
      result.push(usedPath)
    }
    return result;
  },


  deleteFile: function(path) {
    fs.unlinkSync(path);
  },


  renameFile: function(oldPath, newPath) {
    fs.renameSync(oldPath, newPath);
  },


  fileExists: function(path) {
    return fs.existsSync(path)
  },


  ensurePath(pathToEnsure) {
    if (fs.existsSync(pathToEnsure) && fs.statSync(pathToEnsure).isDirectory() === true) {
      return true;
    }
    else {
      fs.mkdirSync(pathToEnsure);
    }
  },

}
