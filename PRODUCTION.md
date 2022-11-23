# 本番環境へのデプロイやトラブルシューティングなど

## WEB(フロントエンド、API)のデプロイ
- デモ用のデプロイはdevelopブランチへpushすれば自動でデプロイされる。
- 本番用のデプロイはmainブランチへpushすれば自動でデプロイされる。

## アプリのリリース  
基本的なリリース方法はWiki参照。
### アプリリリースの手順
- **リリースは必ずmobile-mainブランチに移動**
- **以下の手順は必ずやること**
- GroupWareMobileの.envのAGORA_APP_IDを.env.exampleに記述されているものに必ず変更する。これをやらないと通話が繋がらなくなるという現象が起きてしまいます。
- driveで本番用のGoogle-Service.Info.plistファイルとgoogle-services.jsonをファイルを共有している
- XCodeのサイドバーでディレクトリ構造を見るモードにする。一番上のGroupwareMobileの下にすでにGoogleService-Info.plistがあればそれを削除する。(右クリックでDelete->Remove Reference)。ディレクトリ構造一番上のGroupwareMobileを右クリックし、"Add Files to GroupwareMobile"を選択。GoogleService-Info.plistを選択し、Copy item if neededとCreate groupsとGroupwaremobileにチェックがついていることを確認してAddボタンを押す。
- mobile/android/app内にgoogle-service.jsonを追加(すでにある場合は上書き)
- mobile/android/app/build.gradle 152行目に書いてあるversionCodeを一つ上の番号に書きかえる
- XCodeのディレクトリ構造で一番上のGroupwareMobileを押し、真ん中のウインドウでGeneralタブが開いている状態で、VersionとBuildの番号をそれぞれ一つ上の番号に書きかえる
- 以降は[Wiki](https://valleyin-wiki-sgzkfl3uyq-de.a.run.app/ja/react/react-native/release)通りにビルドすればOK。

## デプロイ時のエラーの対処法
- [GCP](https://console.cloud.google.com)からログを見ることができる。
- 該当のプロジェクトを選択する必要があるので、上のバーのプロジェクト名の部分で、デモ環境でのデプロイの場合は"recruit"、本番環境でのデプロイの場合は"bold-groupware"が選択されていることを確認する。
- 左のメニューからCloud Buildを選択する。
- 左から履歴を選択
- 失敗しているデプロイが赤く表示されているので、クリックしてログを見て原因を探る

## アプリケーションのエラーログを見る方法
- クライアントに見せる用のデモ環境以外はcloud runで作成されているので、cloud runのログを見る
- [GCP](https://console.cloud.google.com)にログインする。
- 該当のプロジェクトを選択する必要があるので、上のバーのプロジェクト名の部分で、デモ環境でのデプロイの場合は"recruit"、本番環境でのデプロイの場合は"bold-groupware"が選択されていることを確認する。
- 左のメニューから"Cloud Run"を選択する
- 該当のCloud Runサービスを選択する。

- recruitのCloud Runサービスは以下
- groupware-development クライアントに見せているデモ用のAPI
- groupware-dev-test デバッグ環境のAPI
- groupware-frontend デバッグ環境のフロントエンド
- bold-groupwareのCloud Runサービスは以下
- frontend-bold-groupware フロントエンドの本番環境
- server-bold-groupware-production APIの本番環境

- 選択後、"ログ"タブに各ログが出ている。直近のエラーは"指標"タブにも出ていたりするので、それも確認する。

## DB
- 本番環境ではバックアップが毎日0:00— 4:00に自動で保存される。最大保存数が7なので、8日以上前のバックアップへは戻せない。
- バックアップの状態までDBを復元するには、[GCP](https://console.cloud.google.com)のサイドメニューからSQLを選択。
- 左のメニューからバックアップを選択し、表示されるバックアップの一覧の中から戻したい日付のものを選び、右の復元ボタンを押す。

## 各種環境変数など
### Cloud Storage
- ファイルアップロードにはCloud Storageを使っているが、これには鍵となるjsonファイルが必要。APIではこれを環境変数をもとに作成しているので、環境変数が間違っているとファイルアップロードができなかったりする。また、bucket名も間違っているとだめなので、GCPのCloud Storageの部分からbucket名が間違っていないか確認する。
- 本番用、開発用ともにdriveで鍵ファイルを共有済み。
### プッシュ通知(Firebase Cloud Messaing)
- プッシュ通知はfirebaseのAPI KEYを利用しているので、これが間違っているとプッシュ通知が送られない。
- iOSのプッシュ通知はfirebaseにプッシュ通知を送るための鍵ファイル(.p8)を登録する必要もある。p8ファイルはdriveで共有済みで、すでに登録はしてあるが覚えておくといい。
- アプリをリリースの部分にも書いてあるが、リリース時にGoogleService-Info.plist/google-services.jsonが本番用のものになっていないとプッシュ通知を受信できない。
