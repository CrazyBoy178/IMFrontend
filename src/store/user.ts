import {defineStore} from 'pinia'

export const useUser = defineStore("user", {
	// State 相当于组件中的 data属性
	state: () => ({
		// 账号昵称
		uid: '',
		nickname: '',
		avatar: '',
		jointime: '',
		// 好友信息
		friendsInfo: {} as any,
		// 好友列表 + 好友消息
		friendsListInfo: [] as any,
		// WebSocket 实例
		webSocketInstance: null as any,


	}),
	// Getters 相当于组件中的 计算属性
	getters: {},
	// Actions 相当于组件中的 methods
	actions: {
		// 创建 WebSocket 实例连接
		async createWebSocket(uid:string,nickname: string,avatar:string,jtime:string) {
			// 验证是否存在实例 存在则先关闭
			if (this.webSocketInstance) {
				this.webSocketInstance.close();
			}
			return new Promise((resolve, reject) => {
				if (!uid) {
					reject('')
					return
				}
				this.uid = uid
				this.avatar = avatar
				this.jointime = jtime
				// 设置用户昵称
				this.nickname = nickname
				// 建立WebSocket全双工通信链接
				this.webSocketInstance = new WebSocket('ws://127.0.0.1:8080/websocket/' + uid)

				//<editor-fold desc="WebSocket事件监听">
				// 监听WebSocket打开事件
				this.webSocketInstance.onopen = () => {
					console.log('WebSocket is connected');
					resolve(true)
				};
				// 监听WebSocket消息事件
				this.webSocketInstance.onmessage = (event: any) => {
					// 接收消息转JSON对象
					const data = JSON.parse(event.data)
					console.log(data)
					if (data.type === 'updateFriendsList') {
						this.updateFriends(data)
					} else if (data.type === 'messages') {
						let findIndex = this.friendsListInfo.findIndex((object: any) => object.uid === data.sendUid);
						if (findIndex !== -1) {
							if (this.friendsListInfo[findIndex].uid === this.friendsInfo.uid){
								this.friendsInfo.latestNews = data.messages
								this.friendsInfo.messages.push({
									type: 'friend', // 消息类型
									message: data.messages// 消息内容
								})
							}else {
								this.friendsListInfo[findIndex].latestNews = data.messages

									this.friendsListInfo[findIndex].unreadMessagesCount++;

								this.friendsListInfo[findIndex].messages.push({
									type: 'friend', // 消息类型
									message: data.messages// 消息内容
								})
							}

						}
					}
				};
				// 监听WebSocket关闭事件
				this.webSocketInstance.onclose = () => {
					console.log('WebSocket is disconnected');
					resolve(false)
				};
				// 监听WebSocket异常事件
				this.webSocketInstance.onerror = (error: any) => {
					console.error('WebSocket error:', error);
					reject(error)
				};
				//</editor-fold>
			})
		},
		// async updateFriends(data: any) {
		// 	// 验证是否存在好友
		// 	if (this.friendsListInfo.length > 0) {
		// 		// 迭代更新的好友列表信息
		// 		for (let i = 0; i < data.messages.length; i++) {
		// 			let findIndex = this.friendsListInfo.findIndex((object: any) => object.uid === data.messages[i].uid);
		// 			// 验证是否一致
		// 			// 不一致 新增好友
		// 			if (findIndex === -1) {
		// 				let friend = {
		// 					status: data.messages[i].status,
		// 					uid: data.messages[i].uid, // 好友账号昵称
		// 					nickname: data.messages[i].nickname,
		// 					avatar: data.messages[i].avatar,
		// 					latestNews: '好友已经上线可以开始聊天了', // 最新消息
		// 					// 消息集合
		// 					messages: [
		// 						{
		// 							type: 'friend', // 消息类型
		// 							message: '好友已经上线可以开始聊天了' // 消息内容
		// 						}
		// 					] as any
		// 				}
		// 				this.friendsListInfo.push(friend)
		// 			}
		// 		}
		//
		// 		// 迭代已经存储的好友列表
		// 		for (let i = 0; i < this.friendsListInfo.length; i++) {
		// 			// 查找好友
		// 			// 移除或者修改在线状态
		// 			let findIndex1 = data.messages.findIndex((object: any) => object.uid === this.friendsListInfo[i].uid);
		// 			if (findIndex1 == -1) {
		// 				// 不存在代表已经离线
		// 				this.friendsListInfo[i].status = 0
		// 				// 验证是否为当前选择好友信息
		// 				if (this.friendsInfo.uid === this.friendsListInfo[i].uid) {
		// 					// 更新当前选择好友的在线状态 更新离线
		// 					this.friendsInfo.status = 0
		// 				}
		// 			} else {
		// 				// 不存在代表已经上线
		// 				this.friendsListInfo[i].status = 1
		// 				// 验证是否为当前选择好友信息
		// 				if (this.friendsInfo.uid === data.messages[findIndex1].uid) {
		// 					// 更新当前好友的在线状态 更新在线
		// 					this.friendsInfo.status = 1
		// 				}
		// 			}
		//
		// 		}
		//
		// 	}
		// 	// 新增初始化第一个好友
		// 	else {
		// 		let friend = {} as any;
		// 		// 迭代初始化好友列表信息
		// 		for (let i = 0; i < data.messages.length; i++) {
		// 			friend = {
		// 				status: data.messages[i].status,
		// 				uid: data.messages[i].uid, // 好友账号昵称
		// 				nickname: data.messages[i].nickname,
		// 				avatar: data.messages[i].avatar,
		//
		//
		// 				latestNews: '好友已经上线可以开始聊天了', // 最新消息
		// 				// 消息集合
		// 				messages: [
		// 					{
		// 						type: 'friend', // 消息类型
		// 						message: '好友已经上线可以开始聊天了' // 消息内容
		// 					}
		// 				] as any
		// 			}
		//
		// 			this.friendsListInfo.push(friend)
		// 		}
		// 		// 默认选择第一个好友信息
		// 		if (data.messages.length > 0) {
		// 			friend = {
		// 				status: data.messages[0].status, // 是否在线状态
		// 				uid: data.messages[0].uid, // 好友账号昵称
		// 				latestNews: '好友已经上线可以开始聊天了', // 最新消息
		// 				// 消息集合
		// 				messages: [
		// 					{
		// 						type: 'friend', // 消息类型
		// 						message: '好友已经上线可以开始聊天了' // 消息内容
		// 					}
		// 				] as any
		// 			}
		// 			this.friendsInfo = friend
		// 		}
		// 	}
		//
		// },

		// 点击用户后将未读消息数清零
		clearUnreadMessages(friend: any) {
			friend.unreadMessagesCount = 0;
		},

		async updateFriends(data: any) {
			if (this.friendsListInfo.length > 0) {
				for (let i = 0; i < data.messages.length; i++) {
					let findIndex = this.friendsListInfo.findIndex((object: any) => object.uid === data.messages[i].uid);
					if (findIndex === -1) {
						// 如果好友不在列表中，则将其添加到列表中
						let friend = {
							status: data.messages[i].status,
							uid: data.messages[i].uid,
							nickname: data.messages[i].nickname,
							avatar: data.messages[i].avatar,
							latestNews: '',
							messages: [],
							unreadMessagesCount:0,

						};

						// 如果好友在线，则发送上线消息
						if (friend.status === 1) {

							friend.latestNews = '好友已经上线可以开始聊天了';
							friend.messages.push({
								type: 'friend',
								message: '好友已经上线可以开始聊天了'
							});
						}

						this.friendsListInfo.push(friend);
					} else {
						// 如果好友在列表中，则更新其状态
						let friend = this.friendsListInfo[findIndex];
						friend.status = data.messages[i].status;
						if (friend.status === 1) {
							friend.latestNews = '好友已经上线可以开始聊天了';
							friend.messages.push({
								type: 'friend',
								message: '好友已经上线可以开始聊天了'
							});
						}
					}
				}
			} else {
				// 如果好友列表为空，则初始化第一个好友
				for (let i = 0; i < data.messages.length; i++) {
					let friend = {
						status: data.messages[i].status,
						uid: data.messages[i].uid,
						nickname: data.messages[i].nickname,
						avatar: data.messages[i].avatar,
						latestNews: '',
						messages: [],
						unreadMessagesCount:0,
					};

					// 如果好友在线，则发送上线消息
					if (friend.status === 1) {
						friend.unreadMessagesCount++;
						friend.latestNews = '好友已经上线可以开始聊天了';
						friend.messages.push({
							type: 'friend',
							message: '好友已经上线可以开始聊天了'
						});
					}

					this.friendsListInfo.push(friend);

					// 默认选择第一个好友信息
					if (i === 0) {
						this.friendsInfo = friend;
					}

				}
			}
			console.log(this.friendsInfo)
		},

		async sendMessages(receiveMessage: string) {
			if (!this.friendsInfo.uid) {
				return false
			}
			let message = {
				type: "messages",
				sendUid: this.uid,
				receiveUid: this.friendsInfo.uid,
				messages: receiveMessage
			}
			this.webSocketInstance.send(JSON.stringify(message))

			let addMessage = {
				type: 'my', // 消息类型
				message: receiveMessage // 消息内容
			}
			this.friendsInfo.messages.push(addMessage)
			this.friendsInfo.latestNews = receiveMessage
			return true
		},
	},
})