import config from '../config.js'

/**
 * 请求工具类
 */
class Request {
	constructor() {
		this.baseUrl = config.api.baseUrl
		this.timeout = config.api.timeout
	}
	
	/**
	 * 发起请求
	 */
	request(options = {}) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: this.baseUrl + options.url,
				method: options.method || 'GET',
				data: options.data || {},
				header: options.header || {
					'Content-Type': 'application/json'
				},
				timeout: options.timeout || this.timeout,
				success: (res) => {
					if (res.statusCode === 200) {
						resolve(res.data)
					} else {
						reject(new Error(`请求失败: ${res.statusCode}`))
					}
				},
				fail: (err) => {
					reject(err)
				}
			})
		})
	}
	
	/**
	 * GET请求
	 */
	get(url, data = {}) {
		return this.request({
			url,
			method: 'GET',
			data
		})
	}
	
	/**
	 * POST请求
	 */
	post(url, data = {}) {
		return this.request({
			url,
			method: 'POST',
			data
		})
	}
}

/**
 * API接口类
 */
class API {
	constructor() {
		this.request = new Request()
	}
	
	/**
	 * 获取监控图片列表 (POST请求)
	 * 接口返回数据格式示例：
	 * {
	 *   code: 0,
	 *   msg: null,
	 *   data: {
	 *     "10.10.70.2": [
	 *       null,
	 *       {
	 *         id: 1,
	 *         ip: "10.10.70.2",
	 *         devName: "老板办公室",
	 *         image: "http://10.10.30.249:32000/accesscontrol/debug_20260129094524_ch1.jpg",
	 *         captureTime: "2026-01-29 09:45:24",
	 *         type: null,
	 *         createTime: 1769651139000,
	 *         updateTime: 1769651139000
	 *       },
	 *       // ... 数组中可能包含null值，需要过滤
	 *     ],
	 *     "10.10.70.3": [
	 *       // ... 另一个IP的图片数组
	 *     ]
	 *   }
	 * }
	 * 
	 * 前端处理逻辑：
	 * - key为IP地址，value为图片数组（可能包含null）
	 * - 过滤掉null值后按数组顺序使用（后端已排序）
	 * - 数组[0]作为主图（彩色）
	 * - 数组[1-2]作为左侧小图（置灰）
	 * - 数组[3-5]作为底部横图（置灰）
	 */
	getCameraImages() {
		return this.request.post(config.api.cameraImagesUrl, {
			currentTimeStr: ''
		})
	}
}

export default new API()
