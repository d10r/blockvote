var appRoot = 'src/';
var outputRoot = 'dist/';
var exportSrvRoot = 'export/';
var stylesRoot = 'styles/';

module.exports = {
  root: appRoot,
  source: appRoot + '**/*.js',
  html: appRoot + '**/*.html',
  css: appRoot + '**/*.css',
  less: appRoot + '**/*.less',
  stylesRoot: stylesRoot,
  style: stylesRoot + '**/*.css',
  output: outputRoot,
  exportSrv: exportSrvRoot,
  doc: './doc',
  e2eSpecsSrc: 'test/e2e/src/**/*.js',
  e2eSpecsDist: 'test/e2e/dist/'
};
