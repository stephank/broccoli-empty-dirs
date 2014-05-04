var path = require('path');
var mkdirp = require('mkdirp');
var walkSync = require('walk-sync');
var mapSeries = require('promise-map-series');
var Writer = require('broccoli-writer');
var helpers = require('broccoli-kitchen-sink-helpers');

// Plugin to remove empty directories.
//
// Takes just a tree and rebuilds it without the empty directories.
var RemoveEmptyDirs = function(tree) {
    if (!(this instanceof RemoveEmptyDirs))
        return new RemoveEmptyDirs(tree);

    this.tree = tree;
};
RemoveEmptyDirs.prototype = Object.create(Writer.prototype);

RemoveEmptyDirs.prototype.write = function(readTree, dst) {
    var self = this;
    return readTree(self.tree)
    .then(function(src) {
        return mapSeries(walkSync(src), function(p) {
            // Skip directories, and mkdirp for all files.
            if (p.slice(-1) === '/') return;
            var i = path.join(src, p);
            var o = path.join(dst, p);
            mkdirp.sync(path.dirname(o));
            helpers.copyPreserveSync(i, o);
        });
    });
};

module.exports = RemoveEmptyDirs;
