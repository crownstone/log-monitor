import fs from "fs";
import path from "path";
import {USER_PATH} from "./config";
import readline, {Interface} from "readline";

export const FileUtil = {

  readJSON: function<T>(filePath : string) : T {
    let data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T
  },


  getUsers: function() : {[userName: string] : any } {
    let items = FileUtil.getDirectoryPaths(USER_PATH)
    let result : {[userName: string] : any } = {}
    for (let userPath of items) {
      let user = path.basename(userPath)
      result[user] = FileUtil.getDates(userPath)
    }
    return result;
  },

  getDirectories: function(inPath) : string[] {
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

  getFileContents(user, date) : string {
    let filePath = path.join(USER_PATH, user, `CrownstoneAppLog${date}.log`);
    return fs.readFileSync(filePath,'utf-8')
  },

  getFileStream(user, date) : Interface {
    let filePath = path.join(USER_PATH, user, `CrownstoneAppLog${date}.log`);
    const file = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout,
      terminal: false
    });
    return file;
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
