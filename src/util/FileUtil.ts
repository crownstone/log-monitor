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
      let dates = FileUtil.getDates(userPath);
      let processedFiles = FileUtil.getProcessedFiles(userPath);

      let processedFileMap = {};
      for (let processedFile of processedFiles) {
        processedFileMap[processedFile] = true;
      }

      let content = [];
      for (let date of dates) {
        content.push({date: date, processed: processedFileMap[date] || false});
      }

      result[user] = content;
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


  getProcessedFiles: function(inPath) : string[] {
    let preprocessedPath = path.join(inPath, "processed");
    let result : string[] = [];
    if (FileUtil.fileExists(preprocessedPath)) {
      let items = fs.readdirSync(preprocessedPath);
      for (let item of items) {
        if (item.indexOf("CrownstoneAppLog") !== -1) {
          result.push(item.substr(16,10))
        }
      }
    }
    return result;
  },

  removeProcessedData(user,date) {
    let filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}.log`);
    return fs.rmSync(filePath);
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

  getProcessedData(user, date) {
    let filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}.log`);
    if (FileUtil.fileExists(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
  },

  storeProcessedData(user, date, data) {
    let filePath = path.join(USER_PATH, user, 'processed', `CrownstoneAppLog${date}.log`);
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
