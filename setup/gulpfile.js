var gulp = require('gulp')
var cp = require('child_process');

gulp.task('default', ['watch'])

gulp.task('redeploy', (callback) => {
	cp.exec('node main.js --compile contracts/blockvote.sol --create demo', (err, stdout, stderr) => {
		console.log('*** ' + stdout)
		console.log('### ' + stderr)
		callback(err)
	})
})

gulp.task('watch', () => {
	gulp.watch('contracts/blockvote.sol', ['redeploy'])
	console.log('bla')
})
