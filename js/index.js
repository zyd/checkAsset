// H5 plus事件处理
function plusReady() {
	// 读写文件
	plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
		// fs.root是根目录操作对象DirectoryEntry
		fs.root.getFile('check.txt', {
			create: true
		}, function(fileEntry) {
			// Write data to file
			fileEntry.createWriter(function(writer) {
				writer.onwrite = function(e) {
					plus.console.log("Write data success!");
				};
				// Write data to the end of file.
				writer.seek(writer.length);
				writer.write("New data!\n");
			}, function(e) {
				alert(e.message);
			});

			fileEntry.file(function(file) {
				var fileReader = new plus.io.FileReader();
				fileReader.readAsText(file, 'utf-8');
				fileReader.onloadend = function(evt) {
					console.log(JSON.stringify(evt));
					console.log(evt.target.result);
					var qr = evt.target.result.split('\n');
					//					var count = 0;
					//					for(var n in qr) {
					//						if(qr[n]) {
					//							count++
					//							alert('二维码：' + qr[n]);
					//						} else {
					//							alert("最后一个");
					//						}
					//					}
					//					alert(count);
				}
			});
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});

}
document.addEventListener("plusready", plusReady, false);


function fileSystem() {
	plus.webview.create('file.html', 'file').show();
}
