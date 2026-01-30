// 明厨亮灶配置文件
export default {
	// API接口配置
	api: {
		// 后端接口地址
		// H5开发环境使用代理路径，APP环境直接使用完整地址
		// #ifdef H5
		baseUrl: '',
		// #endif
		// #ifndef H5
		// baseUrl: 'http://10.10.50.2:6160',
        baseUrl:'http://10.10.30.249:30345',
		// #endif
		cameraImagesUrl: '/api/hkwsimage/hkwsimageByCount',
		timeout: 10000 // 请求超时时间（毫秒）
	},
	

	// 刷新配置
	refresh: {
		imageInterval: 600000, // 监控图片刷新间隔（毫秒）30秒
		timeInterval: 1000 // 时间更新间隔（毫秒）1秒
	},
	
	// 区块配置
	block: {
		count: 4, // 区块数量（固定4个）
		imageCount: 5 // 每个区块的小图数量（固定5张，其中第3张会重复显示在左下和底部左）
	},
	
	// 页面配置
	page: {
		title: '明厨亮灶生产溯源管控', // 页面主标题
		cameraInfoText: '捷租生态网络已覆盖' // 左上角摄像头信息文本
	}
}
