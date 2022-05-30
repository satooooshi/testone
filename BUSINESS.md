# 事務関連

## 月次レポート

- [ポータルサイト月次レポート](https://docs.google.com/spreadsheets/d/1lFYV3G_RyBL6FnkppCNM1jblwyjBPkVp/edit?usp=sharing&ouid=115646302913888293254&rtpof=true&sd=true)を使用して sample 様と作業内容を共有する
- スレッドシート上部の注意事項参照

## 請求書

- 月初第 3 営業日にすべて締めているとのこと。**必ず月初に請求書を送付する**
  例
  1 月度請求書（2 末振り込み）→ 期限 2/3
  2 月度請求書（3 末振り込み → 期限 3/3
- 作成/編集は[こちら](https://docs.google.com/spreadsheets/d/1faZQg1SyCJZXcndq2_5YC7XL7uxD4PjL5qAycZ-fcoE/edit?usp=sharing)
- 保守/運用の請求書は基本、作業期間、右上の請求日、サーバー費用のみ変えれば大丈夫だが、念の為要確認。
- 保守についてはサーバー費用を別途添付する。(以下参照)
- サーバー費用は[GCP のコンソール](https://console.cloud.google.com/home/dashboard?project=bold-groupware)で確認できる。ログインし、上のプロジェクト ID が bold-groupware になっていることを確認する。そして左のサイドバーから、お支払い>レポートを選択すると、グラフがでてくる。右のフィルタから期間を請求月に設定し、プロジェクトが"bold-groupware"、サービスが"すべてのサービス"、SKU が"すべての SKU"になっていることを確認する。その後、上の印刷ボタンから、PDF で保存する。
- bold-groupware のプロジェクトを参照できない場合はおそらく権限がないので、見れる権限のある人に招待してもらう。

## マニュアル作成を求められた場合

- [WEB 納品時に作成したマニュアル](https://docs.google.com/presentation/d/1F_ZVtGZTcusNuoD7sCy4jkNt5YNX_hRu/edit?usp=sharing&ouid=115646302913888293254&rtpof=true&sd=true)や[アプリ納品時に作成したマニュアル](https://docs.google.com/presentation/d/1-NEvHZtFd-p-HvVMw2Su9uZb1GyBA3Ti/edit?usp=sharing&ouid=115646302913888293254&rtpof=true&sd=true)、[クライアントで使っている勤怠システムのマニュアル](https://docs.google.com/presentation/d/1NV_IWaplabzLpRzsYgcEgjJ0IrBgugfP/edit?usp=sharing&ouid=115646302913888293254&rtpof=true&sd=true)を参考に作成する。

## 見積書

- [見積書テンプレート](https://docs.google.com/spreadsheets/d/15-q7qGdNPcE4CLHRhFZRU9KcXZcgaZVlIQMlDb0yxzc/edit?usp=sharing)
- [開発スケジュールサンプル](https://docs.google.com/spreadsheets/d/1l4FEeZTqF_mNK_EA9lUGcCwsAH-wrW0aM5iMIwCALxY/edit?usp=sharing)

## ユーザーアカウント追加を頼まれたら

- groupware-server/src/modules/user/user.controller.ts の

```
  // @Post('register-users')
  // async registerUsers(@Body() users: User[]) {
  //   return await this.userService.registerUsers(users);
  // }
```

と書いてあるところのコメントを外すとユーザー情報の配列を受けとってユーザーを追加/更新し、結果を返す API を使えるようになる

- 本当はよくないだろうが、ローカル API を本番用 DB に繋げてアカウント追加している。
- クライアントからは[このような CSV](https://drive.google.com/file/d/1A5TxzubZKMYeTVtCxMejHLjkREYr07y1/view?usp=sharing)が Shift-JIS で送られてくる
- この CSV から json ファイルを作成する。以下はサンプル  
  package.json

```
{
  "name": "csv-example",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "csv": "^5.5.3",
    "iconv-lite": "^0.6.3"
  }
}
```

index.js

```
const fs = require('fs');
const csv = require('csv');
const iconv = require('iconv-lite')

const parser = csv.parse((error, data) => {

  //変換後の配列を格納
  let newData = [];
  //ループしながら１行ずつ処理
  data.forEach((element, index, array) => {
    newData.push(element);
  })

  // console.log(newData);
  const usersArr = [];

  for (let i = 1; i < newData.length; i++) {
    // const id = i;
    const mailArr = usersArr.map(d => d.email);
    console.log(mailArr)
    const employeeId = newData[i][0];
    const lastName = newData[i][1].split('　')[0];
    const firstName = newData[i][1].split('　')[1];
    const email = newData[i][3];
    //ローカルでテストする際は念の為メールアドレスを存在しないものに変更する
    //const email = Math.random().toString(36).slice(-8) + '@example.com';

    const birthArr = newData[i][4].split('/');
    const year = birthArr[0];
    let month = ''
    let date = ''
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
      introduce,
      password,
      role,
      employeeId,
    }
    usersArr.push(eventObj);
  }

  const jsonEncoded = JSON.stringify(usersArr);
  fs.writeFile(__dirname + '/users.json', jsonEncoded, (err) => {
    if (err) {
      console.log(err);
    }
  });
})

//読み込みと処理を実行
//ここのファイル名は適宜変更する
fs.createReadStream('社員情報2.csv').pipe(iconv.decodeStream('SJIS'))
  .pipe(iconv.encodeStream('UTF-8')).pipe(parser);
```

- 上記のファイルと csv を同じディレクトリに用意し、npm install でライブラリをインストールしてから、`node index.js`でユーザーデータを json に変換した、users.json が作成される。
- これでできた json を Postman などで上記のローカル API、http://localhost:9000/user/register-users に対して POST すると、アカウントを作成できる。
- 本番用のデータを変えるので、念の為ローカル DB で試してからの方がよい。
