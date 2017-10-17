// H5 plus事件处理
function plusReady() {
	plus.webview.currentWebview().show('zoom-fade-out');
	// 更新分享按钮
	plus.share.getServices(function(s) {
		for(var i in s) {
			shares[s[i].id] = s[i];
		}
		var ss = shares['weixin'];
		ss && ss.nativeClient && (
			shareBts.push({
				title: '微信好友',
				s: ss,
				x: 'WXSceneSession'
			}));
		ss = shares['qq'];
		ss && ss.nativeClient && shareBts.push({
			title: 'QQ',
			s: ss
		});
		('Android' === plus.os.name) && shareBts.push({
			title: '更多'
		});
	}, function(e) {
		console.log('updateShare failed: ' + JSON.stringify(e));
	});
	// 设置窗口优化隐藏
	dragHide();

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
					var count = 0;
					for(var n in qr) {
						if(qr[n]) {
							count++
							alert('二维码：' + qr[n]);
						} else {
							alert("最后一个");
						}
					}
					alert(count);
				}
			});
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});

}
document.addEventListener("plusready", plusReady, false);

// 分享应用
var shares = {},
	shareBts = [];

function share() {
	(shareBts.length > 1) || ('Android' !== plus.os.name && shareBts.length > 0) ? plus.nativeUI.actionSheet({
		title: '发送盘点文件',
		cancel: '取消',
		buttons: shareBts
	}, function(e) {
		(e.index > 0) && shareAction(shareBts[e.index - 1]);
	}): (shareBts.length > 0 ? shareWithSystem() : plus.nativeUI.alert('当前环境无法支持分享操作!'));
}

function shareAction(sb) {
	if(!sb.s) {
		shareWithSystem();
		return;
	}
	var msg = {};
	msg.pictures = ['_doc/barcode/check.txt'];
	sb.x && (msg.extra = {
		scene: sb.x
	});
	console.log('share ' + sb.title + ' : ' + JSON.stringify(msg));
	sb.s.authenticated ? shareMessage(sb.s, msg) : sb.s.authorize(function() {
		shareMessage(sb.s, msg);
	}, function(e) {
		plus.nativeUI.toast('取消分享!');
	});
}

function shareMessage(s, m) {
	s.send(m, function() {
		plus.nativeUI.toast('完成分享!');
	}, function(e) {
		plus.nativeUI.toast('取消分享!');
	});
}

function shareWithSystem() {
	plus.share.sendWithSystem ? plus.share.sendWithSystem({
		content: '',
		title: '发送盘点文件',
	}) : shareWithSystemNativeJS();
}

function shareWithSystemNativeJS() {
	var main = plus.android.runtimeMainActivity(),
		Intent = plus.android.importClass('android.content.Intent'),
		File = plus.android.importClass('java.io.File'),
		Uri = plus.android.importClass('android.net.Uri');
	var intent = new Intent(Intent.ACTION_SEND),
		p = plus.io.convertLocalFileSystemURL('_www/icon.png'),
		f = new File(p),
		uri = Uri.fromFile(f);
	if(f.exists() && f.isFile()) {
		intent.setType('image/*');
		intent.putExtra(Intent.EXTRA_STREAM, uri);
	} else {
		intent.setType('text/plain');
	}
	intent.putExtra(Intent.EXTRA_SUBJECT, 'HelloH5');
	intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
	main.startActivity(Intent.createChooser(intent, '分享"HelloH5"应用'));
}

function dragHide() {
	var ws = plus.webview.currentWebview();
	// 窗口隐藏时调整到正确位置（drag操作会修改窗口位置），否则可能导致无法调用show方法显示
	ws.addEventListener('hide', function() {
		ws.setStyle({
			left: '0px'
		});
	}, false);
	// 设置拖动关闭当前窗口
	ws.drag({
		direction: 'right',
		moveMode: 'followFinger'
	}, {
		view: plus.runtime.appid,
		moveMode: 'silent'
	}, function(e) {
		if(e.type == 'end' && e.result) {
			ws.hide();
		}
		console.log('Drag Event: ' + JSON.stringify(e));
	});
}