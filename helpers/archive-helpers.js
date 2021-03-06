var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var utils = require('../web/http-helpers.js');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback){
  fs.readFile(exports.paths.list, 'utf-8', function(error, data) {
    if(error){
      throw error;
    }
    callback(data.split('\n'));
  });
};

exports.isUrlInList = function(fileName, callback){
 
  var isInList = false;
  fs.readFile(exports.paths.list, "utf-8", function(error, data){
    if(error){
      throw error;
    }
    if(data.indexOf(fileName) >= 0){
      isInList = true;
    }
    callback(isInList);
  });
};

exports.addUrlToList = function(fileName, callback){
  fs.appendFile(exports.paths.list, fileName + '\n', function(error) {
    if(error) {
      callback(false);
    }
    callback(true);
  })
};

exports.isUrlArchived = function(filePath, callback){
  fs.exists(filePath, function(exists) {
    callback(exists);
  });
};

exports.downloadUrls = function(urlArray){
  var recurse = function(i){
    if(i === urlArray.length){
      return;
    }
    var urlToArchive = urlArray[i];
    var filePath = path.join(exports.paths.archivedSites, urlToArchive);
    exports.isUrlArchived(filePath, function(archived) {
      if( !archived ) {
        utils.downloadUrl(urlToArchive, function(response) {
          fs.writeFile(filePath, response, function(error) {
            if(error) {
              console.log(error);
            }
            recurse(i+1);
          });
        });
      } else {
        recurse(i+1);
      }
    });
  }
  recurse(0);
};
