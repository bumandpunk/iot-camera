<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 设置屏幕常亮（适合电视展示）
			uni.setKeepScreenOn({
				keepScreenOn: true
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 全局样式 */
	@import './uni.scss';
	
	page {
		background-color: #1a1a1a;
	}
	
	* {
		box-sizing: border-box;
	}
</style>
