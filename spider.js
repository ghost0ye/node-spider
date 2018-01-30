const xlsx = require('node-xlsx').default;
const request = require('request-promise');
const fs = require('fs');
const url = 'http://ba.amac.org.cn/pages/amacWeb/user!list.action';
var opt = {
  filter_LIKES_MPI_NAME: '',
  filter_LIKES_AOI_NAME: '',
  filter_LIKES_MPI_PRODUCT_CODE: '',
  filter_GES_MPI_CREATE_DATE: '',
  filter_LES_MPI_CREATE_DATE: '',
  'page.searchFileName': 'publicity_web',
  'page.sqlKey': 'PAGE_QH_PUBLICITY_WEB',
  'page.sqlCKey': 'SIZE_QH_PUBLICITY_WEB',
  _search: false,
  nd: +new Date(),
  'page.pageSize': 7000,
  'page.pageNo': 1,
  'page.orderBy': 'MPI_CREATE_DATE',
  'page.order': 'desc'
};

request.post(url, {form: opt})
.then(data => {
	data = JSON.parse(data);
	let ids = data.result.map(el => [el.RN, el.MPI_PRODUCT_CODE, el.MPI_NAME, el.AOI_NAME, el.MPI_CREATE_DATE, el.MPI_ID]);
	ids.unshift(['序号', '产品编码', '产品名称', '管理机构', '设立日期', 'MPI_ID']);
	var buffer = xlsx.build([{ name: "spider", data: ids }]); // Returns a buffer
	fs.writeFile("spider.xlsx", buffer, 'binary', err => {
		console.log(err || 'done');
	});
})
.catch(err => {
	console.log(err)
})

// const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
