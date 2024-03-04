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

		groupInfo: {} as any,

		groupListInfo:[] as any,

		// WebSocket 实例
		webSocketInstance: null as any,
		groupwebSocketInstance: null as any,



	}),
	// Getters 相当于组件中的 计算属性
	getters: {},
	// Actions 相当于组件中的 methods
	actions: {
		async initUser(uid:string,nickname: string,avatar:string,jtime:string){
			this.uid = uid
			this.avatar = avatar

			const date = new Date(jtime*1);

			// 使用 Date 对象提供的方法获取年、月、日、小时、分钟和秒
			const year = date.getFullYear();
			const month = ('0' + (date.getMonth() + 1)).slice(-2); // 注意：月份从0开始，需要加1
			const day = ('0' + date.getDate()).slice(-2);

			this.jointime = date.toLocaleDateString()
			// 设置用户昵称
			this.nickname = nickname
		},


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

				const date = new Date(jtime*1);

				// 使用 Date 对象提供的方法获取年、月、日、小时、分钟和秒
				const year = date.getFullYear();
				const month = ('0' + (date.getMonth() + 1)).slice(-2); // 注意：月份从0开始，需要加1
				const day = ('0' + date.getDate()).slice(-2);




				this.jointime = date.toLocaleDateString()
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
								this.friendsListInfo[findIndex].unreadMessagesCount=0;
								this.friendsInfo.latestNews = data.messages
								this.friendsInfo.messages.push({
									sendAvatar: data.sendAvatar,
									type: 'friend', // 消息类型
									message: data.messages// 消息内容
								})

							}else {
								this.friendsListInfo[findIndex].latestNews = data.messages
								this.friendsListInfo[findIndex].unreadMessagesCount++;
								this.friendsListInfo[findIndex].messages.push({
									sendAvatar: data.messages[findIndex].avatar,
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
			})
		},

		async createGroupWebSocket(uid:string, groupId:string) {
			// 验证是否存在实例 存在则先关闭
			if (this.webSocketInstance) {
				this.webSocketInstance.close();
			}
			return new Promise((resolve, reject) => {
				if (!uid) {
					reject('')
					return
				}
				// 建立WebSocket全双工通信链接
				this.groupwebSocketInstance = new WebSocket('ws://127.0.0.1:8080/chatroom/' +groupId + '/' + uid)

				//<editor-fold desc="WebSocket事件监听">
				// 监听WebSocket打开事件
				this.groupwebSocketInstance.onopen = () => {
					console.log('WebSocket is connected');
					resolve(true)
				};
				// 监听WebSocket消息事件
				this.groupwebSocketInstance.onmessage = (event: any) => {
					// 接收消息转JSON对象
					const data = JSON.parse(event.data)
					console.log(data)
					if (data.type === 'updateFriendsList') {
						this.updateFriends(data)
					} else if (data.type === 'messages') {
						let findIndex = this.friendsListInfo.findIndex((object: any) => object.uid === data.sendUid);
						if (findIndex !== -1) {
							if (this.friendsListInfo[findIndex].uid === this.friendsInfo.uid){
								this.friendsListInfo[findIndex].unreadMessagesCount=0;
								this.friendsInfo.latestNews = data.messages
								this.friendsInfo.messages.push({
									sendAvatar: data.sendAvatar,
									type: 'friend', // 消息类型
									message: data.messages// 消息内容
								})

							}else {
								this.friendsListInfo[findIndex].latestNews = data.messages
								this.friendsListInfo[findIndex].unreadMessagesCount++;
								this.friendsListInfo[findIndex].messages.push({
									sendAvatar: data.messages[findIndex].avatar,
									type: 'friend', // 消息类型
									message: data.messages// 消息内容
								})

							}

						}
					}
				};
				// 监听WebSocket关闭事件
				this.groupwebSocketInstance.onclose = () => {
					console.log('WebSocket is disconnected');
					resolve(false)
				};
				// 监听WebSocket异常事件
				this.groupwebSocketInstance.onerror = (error: any) => {
					console.error('WebSocket error:', error);
					reject(error)
				};
			})
		},

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
								sendAvatar: friend.avatar,
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
								sendAvatar: friend.avatar,
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
							sendAvatar: friend.avatar,
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
				sendAvatar: this.avatar,
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