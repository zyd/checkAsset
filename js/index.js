var writerForQr = null;
var qrCount = null;
// H5 plus事件处理
function plusReady() {
	// 获取扫描标签数量
	qrCount = plus.storage.getItem("qrCount");
	if(!qrCount) {
		qrCount = 0;
	} else {
		if(qrCount != 0) {
			var hl = document.getElementById('history');
			hl.innerHTML = '<li id="nohistory" class="ditem">已盘点个数：'+qrCount+'</li>';
		}
	}
	// 读写文件
	plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
		// fs.root是根目录操作对象DirectoryEntry
		fs.root.getFile('check.txt', {
			create: true
		}, function(fileEntry) {
			// Write data to file
			fileEntry.createWriter(function(writer) {
				writerForQr = writer;
				writer.onerror = function(e) {
					alert('写入错误：' + e.target.error.message);
					console.log(JSON.stringify(e));
				};
			}, function(e) {
				alert(e.message);
			});

		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});
}
document.addEventListener("plusready", plusReady, false);

// 文件追加二维码
function appendQr(qr) {
	writerForQr.seek(writerForQr.length);
	writerForQr.write(qr + '\n');
}

function addQrNum() {
	qrCount++;
	plus.storage.setItem("qrCount", qrCount + "");
	var num = plus.storage.getItem("qrCount");
}

function clearQrNum() {
	qrCount = 0;
	plus.storage.setItem("qrCount", "0");
}