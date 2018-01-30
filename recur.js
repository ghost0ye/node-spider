const xlsx = require('node-xlsx').default;
const request = require('request-promise');
const fs = require('fs');
const url = 'http://ba.amac.org.cn/pages/amacWeb/user!search.action';
// ['托管人', '投资类型', '募集规模（万元）', '是否结构化', '初始委托人数量']
var opt = {
  filter_EQS_MPI_ID: 0,
  sqlkey: 'publicity_web',
  sqlval: 'GET_QH_WEB_BY_MPI_ID'
};
var originData = xlsx.parse(`${__dirname}/spider.xlsx`)[0].data;

if (fs.existsSync('log.txt')) {
  fs.readFile('log.txt', 'UTF-8', (err, data) => {
    if (err) throw new Error(err);
    let num = JSON.parse(data).num;
    if (originData.length) {
      recur(originData, num);
    }
  })
} else {
  fs.writeFile('log.txt', JSON.stringify({ num: 1 }), 'UTF-8', err => {
    if (err) throw new Error(err);
  })
}


function recur(data, num) {
  if (data[0].length < 7) {
    data[0] = data[0].concat(['托管人', '投资类型', '募集规模（万元）', '是否结构化', '初始委托人数量']);
  }
  if (num > data.length - 1) {
    writeFile(data, num, 'all done !!!');
  } else {
    if (num % 10 === 0) {
      writeFile(data, num, `split 10 done~ num: ${num}`);
    }
    request.post(url, { form: Object.assign(opt, { filter_EQS_MPI_ID: data[num][5] }) })
      .then(res => {
        res = JSON.parse(res)[0];
        data[num] = data[num].concat([res.MPI_TRUSTEE, res.TZLX, res.MPI_TOTAL_MONEY, res.SFJGH, res.MPI_PARTICIPATION_USER]);
        num++;
        console.log('request num: %s', num)
        recur(data, num);
      })
      .catch(err => {
        console.log(err)
      })
  }
}


function writeFile(data, num, msg) {
  var buffer = xlsx.build([{ name: "spider", data }]); // Returns a buffer
  fs.writeFile("spider.xlsx", buffer, 'binary', err => {
    if (err) throw new Error(err);
    console.log('log num: %s', num);
    fs.writeFile('log.txt', JSON.stringify({ num }), 'UTF-8', logErr => {
      if (logErr) throw new Error(logErr);
      console.log(msg);
    })
  });
}
