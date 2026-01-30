<template>
	<view class="container">
		<!-- 顶部金色渐变导航栏 -->
		<view class="header">
			<view class="header-bg"></view>
			<view class="header-content">
				<view class="camera-info">
					<image class="camera-icon" src="/static/logo-network.png" mode="aspectFit"></image>
					<text class="camera-text">捷租生态网络已覆盖</text>
				</view>
				<view class="title-wrapper">
					<view class="title-line"></view>
					<text class="main-title">3107门神域监控</text>
					<view class="title-line"></view>
				</view>
				<view class="datetime">
					<text class="datetime-text">{{ currentDateTime }}</text>
				</view>
			</view>
		</view>

		<!-- 4个区块的网格布局 -->
		<view class="block-grid">
			<view class="block-item" v-for="(block, blockIndex) in blockList" :key="blockIndex">
				<!-- 空卡片缺省状态 -->
				<view v-if="block.isEmpty" class="empty-block">
					<image class="empty-image" src="/static/empty-camera.png" mode="aspectFit"></image>
					<text class="empty-text">区域待开发</text>
				</view>
				
				<!-- 正常区块内容 -->
				<view v-else class="block-content">
					<!-- 上部区域：左侧2张小图 + 右侧大主图 -->
					<view class="top-section">
						<!-- 左侧2张小图（纵向） -->
						<view class="left-images">
							<view 
								class="left-image-item" 
								v-for="(img, idx) in block.leftImages" 
								:key="'left-' + idx"
							>
								<image 
									class="left-image grayscale" 
									:src="img.imageUrl" 
									mode="aspectFill"
									@error="onImageError(blockIndex, idx)"
								></image>
								<!-- 区域标题悬浮在左上角第一张图上 -->
								<view class="area-title-overlay" v-if="idx === 0">
									<image class="tag-icon" src="/static/title-icon.png" mode="aspectFit"></image>
									<text class="area-title-text">{{ block.areaName }}</text>
								</view>
								<view class="image-overlay">
									<text class="image-time">{{ img.captureTime }}</text>
									<view class="time-badge">{{ img.timeLabel }}</view>
								</view>
							</view>
						</view>
						
						<!-- 右侧大主图 -->
						<view class="main-image-wrapper">
							<image 
								class="main-image" 
								:src="block.mainImage.imageUrl" 
								mode="aspectFill"
								@error="onImageError(blockIndex, 'main')"
							></image>
							<view class="main-overlay">
								<view class="main-time">{{ block.mainImage.captureTime }}</view>
								<view class="latest-badge">最新</view>
							</view>
							<view class="border-decoration tl"></view>
							<view class="border-decoration tr"></view>
							<view class="border-decoration bl"></view>
							<view class="border-decoration br"></view>
						</view>
					</view>
					
					<!-- 底部3张横图 -->
					<view class="bottom-section">
						<view 
							class="bottom-image-item" 
							v-for="(img, idx) in block.bottomImages" 
							:key="'bottom-' + idx"
						>
							<image 
								class="bottom-image grayscale" 
								:src="img.imageUrl" 
								mode="aspectFill"
								@error="onImageError(blockIndex, idx + 2)"
							></image>
							<view class="image-overlay">
								<text class="image-time">{{ img.captureTime }}</text>
								<view class="time-badge">{{ img.timeLabel }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import api from '@/utils/api.js'
import config from '@/config.js'

export default {
	data() {
		return {
			currentDateTime: '',
			blockList: [],
			refreshTimer: null,
			timeTimer: null
		}
	},
	onLoad() {
		this.updateDateTime()
		this.fetchCameraImages()
		
		// 每秒更新时间
		this.timeTimer = setInterval(() => {
			this.updateDateTime()
		}, config.refresh.timeInterval)
		
		// 定时刷新监控画面
		this.refreshTimer = setInterval(() => {
			this.fetchCameraImages()
		}, config.refresh.imageInterval)
	},
	onUnload() {
		if (this.refreshTimer) {
			clearInterval(this.refreshTimer)
		}
		if (this.timeTimer) {
			clearInterval(this.timeTimer)
		}
	},
	methods: {
		// 更新当前时间
		updateDateTime() {
			const now = new Date()
			const year = now.getFullYear()
			const month = String(now.getMonth() + 1).padStart(2, '0')
			const day = String(now.getDate()).padStart(2, '0')
			const hours = String(now.getHours()).padStart(2, '0')
			const minutes = String(now.getMinutes()).padStart(2, '0')
			const seconds = String(now.getSeconds()).padStart(2, '0')
			this.currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
		},
		
		// 获取监控图片
		async fetchCameraImages() {
			try {
				const result = await api.getCameraImages()
				
				// 接口返回格式：{ code: 0, msg: null, data: { "10.10.70.2": [...], "10.10.70.3": [...] } }
				if (result.code !== 0 || !result.data) {
					throw new Error('接口返回数据格式错误')
				}
				
				// 将接口返回的对象转换为数组，key是IP地址
				const ipAddresses = Object.keys(result.data)
				const actualBlockCount = ipAddresses.length // 实际返回的区域数量
				
				// 总是显示4个区块
				this.blockList = Array(4).fill(null).map((_, blockIndex) => {
					// 如果超过实际数据数量，显示空卡片
					if (blockIndex >= actualBlockCount) {
						return {
							isEmpty: true
						}
					}
					
					// 有数据的区域正常渲染
					const ip = ipAddresses[blockIndex]
					const rawImages = result.data[ip] || []
					
					// 不过滤null，保持原始索引位置
					// 如果数组长度为0，显示空卡片
					if (rawImages.length === 0) {
						return {
							isEmpty: true
						}
					}
					
					// 直接使用原始数组，按索引位置渲染：
					// rawImages[0]作为主图，rawImages[1-2]作为左侧小图，rawImages[3-5]作为底部横图
					// 如果某个索引是null，则显示缺省图
					
					const mainImageData = rawImages[0] || null
					
					// 使用 devName 作为区域名称，如果主图是null则查找第一个非null的devName
					let areaName = ip // 默认使用IP
					if (mainImageData && mainImageData.devName) {
						areaName = mainImageData.devName
					} else {
						// 如果主图是null，从其他位置找devName
						const firstValidImage = rawImages.find(img => img !== null && img !== undefined)
						if (firstValidImage && firstValidImage.devName) {
							areaName = firstValidImage.devName
						}
					}
					
					// 固定的时间标签文字
					const timeLabels = ['半小时前', '1小时前', '1.5小时前', '2小时前', '2.5小时前']
					
					return {
						isEmpty: false,
						areaName: areaName,
						mainImage: {
							imageUrl: mainImageData?.image || '/static/empty-camera.png',
							captureTime: mainImageData?.captureTime || this.formatTime(new Date())
						},
						// 左侧2张小图：直接使用rawImages[1]和rawImages[2]
						leftImages: Array(2).fill(null).map((_, idx) => {
							const img = rawImages[idx + 1] // 索引1和2
							return {
								imageUrl: img?.image || '/static/empty-camera.png',
								captureTime: img?.captureTime || this.formatTime(new Date()),
								timeLabel: timeLabels[idx]
							}
						}),
						// 底部3张横图：直接使用rawImages[3]、rawImages[4]和rawImages[5]
						bottomImages: Array(3).fill(null).map((_, idx) => {
							const img = rawImages[idx + 3] // 索引3、4、5
							return {
								imageUrl: img?.image || '/static/empty-camera.png',
								captureTime: img?.captureTime || this.formatTime(new Date()),
								timeLabel: timeLabels[idx + 2]
							}
						})
					}
				})
				
				console.log('监控图片刷新成功:', this.currentDateTime, '实际区域数:', actualBlockCount)
			} catch (error) {
				console.error('获取监控图片失败:', error)
				this.initDefaultBlocks()
			}
		},
		
		// 初始化默认区块数据
		initDefaultBlocks() {
			this.blockList = Array(4).fill(null).map(() => ({
				areaName: '生产区',
				mainImage: {
					imageUrl: '/static/default-camera.png',
					captureTime: this.formatTime(new Date())
				},
				leftImages: Array(2).fill(null).map((_, idx) => ({
					imageUrl: '/static/default-camera.png',
					captureTime: this.formatTime(new Date()),
					timeLabel: `${0.5 * (idx + 1)}小时前`
				})),
				bottomImages: Array(3).fill(null).map((_, idx) => ({
					imageUrl: '/static/default-camera.png',
					captureTime: this.formatTime(new Date()),
					timeLabel: `${1.5 + 0.5 * idx}小时前`
				}))
			}))
		},
		
		// 图片加载失败处理
		onImageError(blockIndex, imageIndex) {
			if (imageIndex === 'main') {
				this.blockList[blockIndex].mainImage.imageUrl = '/static/default-camera.png'
			} else if (imageIndex < 2) {
				this.blockList[blockIndex].leftImages[imageIndex].imageUrl = '/static/default-camera.png'
			} else {
				this.blockList[blockIndex].bottomImages[imageIndex - 2].imageUrl = '/static/default-camera.png'
			}
		},
		
		// 格式化时间
		formatTime(date) {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hours = String(date.getHours()).padStart(2, '0')
			const minutes = String(date.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day} ${hours}:${minutes}`
		}
	}
}
</script>

<style scoped>
.container {
	width: 100vw;
	height: 100vh;
	background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
	overflow: hidden;
}

/* 头部样式 */
.header {
	position: relative;
	height: 8vh;
	padding: 1.5vh 2vw;
}

.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(90deg, 
		rgba(139, 116, 58, 0.3) 0%, 
		rgba(205, 170, 85, 0.5) 20%,
		rgba(255, 215, 100, 0.6) 50%,
		rgba(205, 170, 85, 0.5) 80%,
		rgba(139, 116, 58, 0.3) 100%
	);
	border-bottom: 2px solid rgba(255, 215, 100, 0.8);
	box-shadow: 0 4px 20px rgba(255, 215, 100, 0.3);
}

.header-content {
	position: relative;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 100%;
	z-index: 1;
}

.camera-info {
	display: flex;
	align-items: center;
	gap: 1vw;
}

.camera-icon {
	width: 2.5vw;
	height: 2.5vw;
}

.camera-text {
	font-size: 1.4vw;
	color: #ffffff;
	letter-spacing: 1px;
	margin-left: 3px;
}

.title-wrapper {
	display: flex;
	align-items: center;
	gap: 2vw;
}

.title-line {
	width: 5vw;
	height: 2px;
	background: linear-gradient(90deg, transparent, rgba(255, 215, 100, 0.8), transparent);
}

.main-title {
	font-size: 2.5vw;
	font-weight: bold;
	color: #ffd764;
	text-shadow: 0 0 20px rgba(255, 215, 100, 0.6),
				 0 0 40px rgba(255, 215, 100, 0.3);
	letter-spacing: 3px;
}

.datetime {
	display: flex;
	align-items: center;
}

.datetime-text {
	font-size: 1.6vw;
	color: #ffffff;
	font-family: 'Courier New', monospace;
	letter-spacing: 1px;
}

/* 区块网格：2行2列 */
.block-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: repeat(2, 1fr);
	gap: 1.5vh;
	padding: 1.5vh 2vw;
	height: calc(100vh - 10vh);
}

.block-item {
	background: rgba(20, 20, 20, 0.5);
	border-radius: 12px;
	padding: 1.2vh;
	border: 1px solid rgba(255, 215, 100, 0.2);
	display: flex;
	flex-direction: column;
}

/* 空卡片缺省状态 */
.empty-block {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 2vh;
}

.empty-image {
	width: 16vw;
	height: 16vw;
	opacity: 0.6;
}

.empty-text {
	font-size: 1.8vw;
	color: rgba(255, 215, 100, 0.5);
	letter-spacing: 2px;
	margin-top: -9vh;
}

/* 区域标题悬浮在左上角第一张图上 */
.area-title-overlay {
	position: absolute;
	top: 0.7vh;
	left: 0.5vw;
	display: flex;
	align-items: center;
	gap: 0.3vw;
	padding: 0.4vh 0.2vw;
	/* background: rgba(0, 0, 0, 0.7); */
	border-radius: 8px;
	/* border: 1px solid rgba(255, 215, 100, 0.5); */
	backdrop-filter: blur(2px);
	z-index: 2;
}

.tag-icon {
	width: 2vw;
	height: 2vw;
}

.area-title-text {
	font-size: 1.2vw;
	color: #ffffff;
	font-weight: bold;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* 区块内容 */
.block-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 1.2vh;
}

/* 上部区域：左2右1 */
.top-section {
	flex: 1;
	display: flex;
	gap: 1.2vh;
}

/* 左侧2张小图（纵向排列） */
.left-images {
	flex: 0 0 33%;
	display: flex;
	flex-direction: column;
	gap: 1.2vh;
}

.left-image-item {
	position: relative;
	flex: 1;
	border-radius: 8px;
	overflow: hidden;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(100, 100, 100, 0.3);
}

.left-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.left-image.grayscale {
	filter: grayscale(100%) brightness(0.6);
	opacity: 0.7;
}

/* 右侧大主图 */
.main-image-wrapper {
	position: relative;
	flex: 1;
	border-radius: 10px;
	overflow: hidden;
	background: rgba(0, 0, 0, 0.8);
}

.main-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.main-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.8));
	padding: 0.6vh 1vw;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.main-time {
	font-size: 1vw;
	color: #ffffff;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.latest-badge {
	padding: 0.3vh 0.7vw;
	background: rgba(50, 205, 50, 0.8);
	border-radius: 6px;
	font-size: 1vw;
	color: #ffffff;
	font-weight: bold;
}

/* 边角装饰 */
.border-decoration {
	position: absolute;
	width: 3vw;
	height: 3vw;
	border-color: rgba(255, 215, 100, 0.8);
	border-style: solid;
	z-index: 1;
}

.border-decoration.tl {
	top: 0;
	left: 0;
	border-width: 1px 0 0 1px;
}

.border-decoration.tr {
	top: 0;
	right: 0;
	border-width: 1px 1px 0 0;
}

.border-decoration.bl {
	bottom: 0;
	left: 0;
	border-width: 0 0 1px 1px;
}

.border-decoration.br {
	bottom: 0;
	right: 0;
	border-width: 0 1px 1px 0;
}

/* 底部3张横图 */
.bottom-section {
	flex: 0 0 33%;
	display: flex;
	gap: 1vh;
}

.bottom-image-item {
	position: relative;
	flex: 1;
	border-radius: 8px;
	overflow: hidden;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid rgba(100, 100, 100, 0.3);
}

.bottom-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.bottom-image.grayscale {
	filter: grayscale(100%) brightness(0.6);
	opacity: 0.7;
}

.image-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.9));
	padding: 0.4vh 0.4vw;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.image-time {
	font-size: 0.6vw;
	color: #ffffff;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.time-badge {
	padding: 0.2vh 0.4vw;
	background: rgba(209, 166, 102, 1);
	border-radius: 4px;
	font-size: 0.6vw;
	color: #ffffff;
	white-space: nowrap;
}
</style>
