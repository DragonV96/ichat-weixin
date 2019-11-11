window.app = {
	
	/**
	 * netty后端服务发布的url地址
	 */
	nettyServerUrl: 'ws://192.168.200.31:8088',
	
	/**
	 * 后端服务发布的url地址
	 */
	serverUrl: 'http://192.168.200.31:8080',
	
	/**
	 * 图片服务器的url地址
	 */
	imgServerUrl: 'http://192.168.241.130/',

	HEARTBEATMS: 50000,	// 心跳毫秒数
	KEY: "Cwq+cXsLku9VmJq8MOt4+CmW1NjW0QCe",	// 消息加解密密钥
	
	/**
	 * 判断字符串是否为空
	 * @param {Object} str
	 * true：不为空
	 * false：为空
	 */
	isNotNull: function(str) {
		if(str != null && str != "" && str != undefined) {
			return true;
		}
		return false;
	},
	
	/**
	 * 封装消息提示框，默认mui的不支持居中和自定义icon，所以使用h5+
	 * @param {Object} msg
	 * @param {Object} type
	 */
	showToast: function(msg, type) {
		plus.nativeUI.toast(msg, {icon: "image/" + type + ".png", verticalAlign: "center"})
	},
	
	/**
	 * 保存用户的全局对象进缓存中
	 * @param {Object} user
	 */
	setUserGlobalInfo: function(user) {
		var userInfoStr = JSON.stringify(user);
		plus.storage.setItem("userInfo", userInfoStr);
	},
	
	/**
	 * 获取用户的全局对象
	 */
	getUserGlobalInfo: function() {
		var userInfoStr = plus.storage.getItem("userInfo");
		return JSON.parse(userInfoStr);
	},
	
	/**
	 * 退出登录后，移除
	 */
	userLogOut: function() {
		plus.storage.removeItem("userInfo");
	},
	
	/**
	 * 保存用户的联系人列表
	 * @param {Object} contactList
	 */
	setContactList: function(contactList) {
		var contactListStr = JSON.stringify(contactList);
		plus.storage.setItem("contactList", contactListStr);
	},
	
	/**
	 * 获取本地缓存中的联系人列表
	 */
	getContactList: function() {
		var contactListStr = plus.storage.getItem("contactList");
		if (!this.isNotNull(contactListStr)) {
			return [];
		}
		
		return JSON.parse(contactListStr);
	},
	
	/**
	 * 根据用户id，从本地的缓存（联系人列表）中获取朋友的信息
	 * @param {Object} friendId
	 */
	getFriendInfoFromContactList: function(friendId) {
		var contactListStr = plus.storage.getItem("contactList");
		
		// 判断contactListStr是否为空
		if (this.isNotNull(contactListStr)) {
			// 不为空，则返回用户信息
			var contactList = JSON.parse(contactListStr);
			for (var i = 0; i < contactList.length; i++) {
				var friendItem = contactList[i];
				if (friendItem.friendUserId == friendId) {
					return friendItem;
					break;
				}
			}
		} else {
			// 为空，则返回null
			return null;
		}
	},
	
	/**
	 * 保存用户的聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} flag		判断本条消息是自己发送的，还是由朋友发送的，1：我 2：朋友
	 */
	saveUserChatHistory: function(myId, friendId, msg, flag) {
		var me = this;
		var chatKey = "chat-" + myId + "-" + friendId;
		
		// 从本地缓存获取聊天记录是否存在
		var chatHistoryListStr = plus.storage.getItem(chatKey);
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {
			// 如果不为空
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} else {
			// 如果为空，赋一个空的list
			chatHistoryList = [];
		}
		
		// 构建聊天记录对象
		var singleMsg = new me.ChatHistory(myId, friendId, msg, flag);
		
		// 向list中追加msg对象
		chatHistoryList.push(singleMsg);
		
		plus.storage.setItem(chatKey, JSON.stringify(chatHistoryList));
	},
	
	/**
	 * 从本地缓存获取用户聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	getUserChatHistory: function(myId, friendId) {
		var me = this;
		var chatKey = "chat-" + myId + "-" + friendId;
		var chatHistoryListStr = plus.storage.getItem(chatKey);
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {
			// 如果不为空
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} else {
			// 如果为空，赋一个空的list
			chatHistoryList = [];
		}
		
		return chatHistoryList;
	},
	
	/**
	 * 删除我和朋友的聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	deleteUserChatHistory: function(myId, friendId) {
		var chatKey = "chat-" + myId + "-" + friendId;
		plus.storage.removeItem(chatKey);
	},
	
	/**
	 * 聊天记录的快照，仅仅保存每次和朋友聊天的最后一条消息
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} isRead
	 */
	saveUserChatSnapshot: function(myId, friendId, msg, isRead) {
		var me = this;
		var chatKey = "chat-snapshot-" + myId;
		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环快照list，并且判断每个元素是否匹配friendId，若匹配，则删除
			for (var i = 0; i < chatSnapshotList.length; i++) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已经存在的friendId对应的快照对象
					chatSnapshotList.splice(i, 1);	// splice：从第i个元素往后删除
					break;
				}
			}
		} else {
			// 如果为空，赋一个空的list
			chatSnapshotList = [];
		}
		
		// 构建聊天快照对象
		var singleSnapshot = new me.ChatSnapshot(myId, friendId, msg, isRead);
		
		// 向list中追加聊天快照对象
		chatSnapshotList.unshift(singleSnapshot);	//用push，顺序会错乱
		
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
	},
	
	/**
	 * 获取用户快照记录列表
	 * @param {Object} myId
	 */
	getUserChatSnapshot: function(myId) {
		var me = this;
		var chatKey = "chat-snapshot-" + myId;
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
		} else {
			// 如果为空，赋一个空的list
			chatSnapshotList = [];
		}
		
		return chatSnapshotList;
	},
	
	/**
	 * 删除本地聊天快照记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	deleteUserChatSnapshot: function(myId, friendId) {
		var me = this;
		var chatKey = "chat-snapshot-" + myId;
		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环快照list，并且判断每个元素是否匹配friendId，若匹配，则删除
			for (var i = 0; i < chatSnapshotList.length; i++) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已经存在的friendId对应的快照对象
					chatSnapshotList.splice(i, 1);	// splice：从第i个元素往后删除
					break;
				}
			}
		} else {
			// 如果为空，不处理
			return;
		}
		
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
	},
	
	/**
	 * 标记未读消息为已读状态
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	readUserChatSnapshot: function(myId, friendId) {
		var me = this;
		var chatKey = "chat-snapshot-" + myId;
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环chatSnapshotList，判断是否存在好友，比对friendId
			// 若有，在list中的原有位置删除该快照对象，然后重新放入一个标记已读的快照对象
			for (var i = 0; i < chatSnapshotList.length; i++) {
				var item = chatSnapshotList[i];
				if (item.friendId == friendId) {
					item.isRead = true;		// 标记为已读
					// 删除已经存在的friendId对应的快照对象
					chatSnapshotList.splice(i, 1, item);	// 替换原有的聊天快照对象
					break;
				}
			}
			// 替换原有的快照列表
			plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
			
		} else {
			// 为空
			return;
		}
	},
	
	/**
	 * 和后端的枚举对应
	 */
	MY_MSG: 1, 	// "自己发送"
    FRIEND_MSG: 2, 		// "朋友发送的消息"
	
	/**
	 * 和后端的枚举对应
	 */
	CONNECT: 1, 	// "第一次（或重连）初始化连接"
    CHAT: 2, 		// "聊天消息"
    SIGNED: 3, 		// "消息签收"
    KEEPALIVE: 4, 	// "客户端保持心跳"
    PULL_FRIEND: 5,	// "重新拉取通讯录"
    
    /**
     * 和后端的ChatMsg聊天模型对象保持一致
     * @param {Object} senderId
     * @param {Object} receiverId
     * @param {Object} msg
     * @param {Object} msgId
     */
    ChatMsg: function(senderId, receiverId, msg, msgId) {
    	this.senderId = senderId;
    	this.receiverId = receiverId;
    	this.msg = msg;
    	this.msgId = msgId;
    },
    
    /**
     * 构建DataContent消息模型对象
     * @param {Object} action
     * @param {Object} chatMsg
     * @param {Object} extand
     */
    DataContent: function(action, chatMsg, extand) {
    	this.action = action;
    	this.chatMsg = chatMsg;
    	this.extand = extand;
    },
    
    /**
     * 单个聊天记录的对象
     * @param {Object} myId
     * @param {Object} friendId
     * @param {Object} msg
     * @param {Object} flag
     */
    ChatHistory: function(myId, friendId, msg, flag) {
    	this.myId = myId;
    	this.friendId = friendId;
    	this.msg = msg;
    	this.flag = flag;
    },
    
    /**
     * 快照对象
     * @param {Object} myId
     * @param {Object} friendId
     * @param {Object} msg
     * @param {Object} isRead 用于判断消息已读还是未读
     */
    ChatSnapshot: function(myId, friendId, msg, isRead) {
    	this.myId = myId;
    	this.friendId = friendId;
    	this.msg = msg;
    	this.isRead = isRead;
    }
}
