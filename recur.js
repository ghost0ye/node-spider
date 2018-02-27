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


function segmentRecur(data, num = 0) {
  let length = data.length;
  let sublength = 10;
  let end = Math.floor(length / sublength);
  let rest = length % sublength;
  if (num === end) {
    for (let i = end * sublength; i < end * sublength + rest; i++) {
      recur(data, i);
    }
    return;
  } else {
    for (let i = num * sublength; i < (num + 1) * sublength; i++) {
      if (i === 0) {
        data[0] = data[0].concat(['托管人', '投资类型', '募集规模（万元）', '是否结构化', '初始委托人数量']);
      } else {
        recur(data, i);
      }
    }
  }
  let timer = setInterval(function() {
    let result = data.slice(num * sublength, (num + 1) * sublength);
    if (result.every(el => el.length > 7)) {
      clearInterval(timer);
      writeFile(data, num, `segmengt ${num * 10} ~~ ${(num + 1) * 10} dnoe`);
    }
  }, 1000 / 60);
  setTimeout(segmentRecur, 333, data, ++num);
  // segmentRecur(data, ++num);
}

function recur(data, i) {
  console.log(i);
  request.post(url, { form: Object.assign(opt, { filter_EQS_MPI_ID: data[i][5] }) })
    .then(res => {
      res = JSON.parse(res)[0];
      data[i] = data[i].concat([res.MPI_TRUSTEE, res.TZLX, res.MPI_TOTAL_MONEY, res.SFJGH, res.MPI_PARTICIPATION_USER]);
    })
    .catch(err => {
      console.log(err)
    })
}




if (fs.existsSync('log.txt')) {
  fs.readFile('log.txt', 'UTF-8', (err, data) => {
    if (err) throw new Error(err);
    let num = JSON.parse(data).num;
    if (originData.length) {
      segmentRecur(originData, num);
    }
  })
} else {
  fs.writeFile('log.txt', JSON.stringify({ num: 0 }), 'UTF-8', err => {
    if (err) throw new Error(err);
  })
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
