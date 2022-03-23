const fs = require('fs');
const csv = require('csv');
const iconv = require('iconv-lite');

const parser = csv.parse((error, data) => {
  //変換後の配列を格納
  let newData = [];
  //ループしながら１行ずつ処理
  data.forEach((element, index, array) => {
    newData.push(element);
  });

  const usersArr = [];

  for (let i = 1; i < newData.length; i++) {
    // const id = i;
    const mailArr = usersArr.map((d) => d.email);
    console.log(mailArr);
    const employeeId = newData[i][0];
    const lastName = newData[i][1].split('　')[0];
    const firstName = newData[i][1].split('　')[1];
    // const email = newData[i][3];
    //ローカルでテストする際は念の為メールアドレスを存在しないものに変更する
    const email = Math.random().toString(36).slice(-8) + '@example.com';

    if (!email) {
      continue;
    }

    const lastNameKana = newData[i][2].split('　')[0];
    const firstNameKana = newData[i][2].split('　')[1];
    const birthArr = newData[i][4].includes('/')
      ? newData[i][4].split('/')
      : newData[i][4].split('.');
    // const birthArr = newData[i][4].split('/');
    const year = birthArr[0];
    // let month = birthArr[1]
    // let date = birthArr[2]
    if (mailArr.includes(email)) {
      console.error('same email found', email);
      return;
    }
    if (birthArr[1].length !== 2) {
      month = `0${birthArr[1]}`;
    } else {
      month = birthArr[1];
    }
    if (birthArr[2].length !== 2) {
      date = `0${birthArr[2]}`;
    } else {
      date = birthArr[2];
    }
    const password = [year, month, date].join('');
    const introduce = '';
    const role = 'common';

    const eventObj = {
      // id,
      email,
      lastName,
      firstName,
      lastNameKana,
      firstNameKana,
      // introduce,
      password,
      // role,
      employeeId,
    };
    usersArr.push(eventObj);
  }

  const jsonEncoded = JSON.stringify(usersArr);
  fs.writeFile(__dirname + '/users.json', jsonEncoded, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

//読み込みと処理を実行
//ここのファイル名は適宜変更する
fs.createReadStream('社員情報 (1).csv')
  .pipe(iconv.decodeStream('SJIS'))
  .pipe(iconv.encodeStream('UTF-8'))
  .pipe(parser);
