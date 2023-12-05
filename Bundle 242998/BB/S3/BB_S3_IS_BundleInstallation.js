/**
 * @NApiVersion 2.0
 * @NScriptType BundleInstallationScript
 */
define(['N/file'], function(file) {
    var folder = '/SuiteBundles/Bundle 207067/BB/S3/Lib/';
	var dependencyFiles = [
		folder + 'BB.S3.js',
		folder + 'bb_framework_all.js',
		folder + 'crypto-js.js'
    ];
    
    var dependencyFilesV2 = [
		folder + 'BB.S3.js (2)',
		folder + 'bb_framework_all.js (2)',
		folder + 'crypto-js.js (2)'
	];

	function fixDependencyFiles() {
		for (var i=0; i < dependencyFiles.length; i++) {
			readdFile(i);
		}
	}

	function readdFile(index) {
        var path = dependencyFilesV2[index];
        var fileId = -1;
        var folderId = -1;
        var contents = '';
        // First try to deal with (2) version
        try {
            var cryptoFile = file.load({
                id: path
            });
            fileId = cryptoFile.id;
            contents = cryptoFile.getContents();
            file.delete({
                id: fileId
            });
        } catch (e) {
        }

        path = dependencyFiles[index];
        cryptoFile = file.load({
            id: path
        });
        fileId = cryptoFile.id;
        folderId = cryptoFile.folder;
        contents = contents || cryptoFile.getContents();
        file.delete({
            id: fileId
        });

        var newFile = file.create({
			name: cryptoFile.name,
			fileType: cryptoFile.fileType,
			contents: contents
		});
		newFile.folder = folderId;
        newFile.save();
	}

	function afterInstall(params) {
		fixDependencyFiles(false);
	}

    // This needs to do something to account for (2) versions of the files after update happens...
	function afterUpdate(params) {
		fixDependencyFiles(true);
	}

	return {
		afterInstall: afterInstall,
		afterUpdate: afterUpdate
	}
});