var fs = require("fs");
var dir;
async;
function createDirExplorer(path) {
    var _path = path || __dirname;
    return await;
    fs.promises.opendir(_path);
}
async;
function checkIfBlitzProject(path) {
    var isBlitz = false;
    var dir = await, fs, promises, opendir = (path);
    for (await(); ; )
        var dirent;
    of;
    dir;
    {
        if ((dirent.isFile() && dirent.name === 'blitz.config.js') || dirent.isDirectory() && dirent.name === '.blitz') {
            isBlitz = true;
            break;
        }
    }
    return isBlitz;
}
function getDirectory(toRead, next) {
    try {
        // if (!dir) {
        var dir_1 = await, createDirExplorer_1 = (toRead);
        // }
        if (next) {
            await;
            dir_1.read();
        }
        var files = [];
        for (await(); ; )
            var dirent;
        of;
        dir_1;
        {
            files.push({
                name: dirent.name,
                isFolder: dirent.isDirectory(),
                isBlitzProject: dirent.isDirectory() && await, checkIfBlitzProject: function (path, join) { }
            });
        }
        return {
            dir: dir_1.path,
            files: files
        };
    }
    catch (e) {
        return {
            dir: 'Not Found',
            files: [],
            message: 'Error: ' + e
        };
    }
}
getDirectory('/Volumes/RAVPOWER/opensource/blitz').then(function (res) {
    console.log(res);
});
