# Groupware

## クライアント

この案件のクライアントは株式会社ボールド様(SES 企業)です。このグループウェアはボールド様の社内で使用する情報共有、チャットツールとして使用されます。クライアントとの会話では「ポータルサイト」、「ポータルアプリ」などと呼ばれています。

## アプリのリリース  
リリース方法はWiki参照。**リリースは必ずmobile-mainブランチでやる**

## メイン機能

- イベント管理
- 社内 Wiki
- 社員名鑑
- チャット
- 管理画面
- 勤怠管理(未実装)

## ユーザー権限

- ユーザーは管理者/講師(外部)/講師(内部)/コーチ/一般社員の区分で分かれている。東京/大阪支社などの区分も別でいれたいという要望も出ているが、仕様など未相談。  
  **各権限については以下を必ず参照**  
  [権限管理表](https://docs.google.com/spreadsheets/d/14mRTBgYcpNwl1-85PGnZFK3zukKpzxuaefngg-Z54sk/edit?usp=sharing)

# イベント

- イベントは"感動大学"/"技術勉強会"/"BOLDay"/"コーチ制度"/"部活動"/"提出物等"に分かれている
- 提出物等のみ仕様が異なる
- イベント概要に含まれているリンクは押せる必要がある
- イベントはカレンダーで表示することができ、自分が参加予定のイベントのみ表示する My カレンダーとそれ以外を表示する全体カレンダーにわかれる

## 提出物以外のイベント

- イベント終了前であればイベントへの参加申し込みができる
- イベント終了前であればイベントへの参加申し込みをキャンセルできる
- キャンセル後は再度参加申し込みできない(一般社員が好き勝手に参加したりキャンセルしたりできないように)
- 管理者は各ユーザーに関して遅刻を記録できる(権限要確認)
- イベント作成時にチャットルームを作成するかどうかを選ぶことができる。作成する選択をしたら、まずイベント作成者一人だけのメンバーから構成され、ルーム名がイベントのタイトルになっているルームが作成される。そのイベントに参加申し込みをした人は自動的にこのルームに追加される
- 管理者はイベントデータを CSV でダウンロードできる

## 提出物

- 締切前であれば提出物を提出できる
- 提出済みの提出物は削除できない(提出後に削除されると困る可能性があるので)
- 管理者は提出されたものを一括で ZIP ファイルをダウンロードできる
- イベント作成時にチャットルームを作成するかどうかを選ぶことはできない。

# 社内 Wiki

- Wiki は社内規則/オール便/掲示板の大枠で分かれている
- 社内規則内は会社理念/社内規則/ABC 制度/福利厚生等/各種申請書で分かれている
- 掲示板内は全て/ナレッジ/Q&A/本社からのお知らせ/感動大学/部活動・サークル/勉強会に分かれている
- 掲示板->Q&A のみ仕様が違い、知恵袋のように回答、回答への返信、ベストアンサーを選ぶことができる(ベストアンサーを選べるのは質問者のみ)
- **開発初期は社内エンジニアの情報共有として Q&A のみを想定していた状態から仕様変更が重なったという経緯がある。事務の方など、エンジニア以外も使うシステムになった**
- Wiki はマークダウン、リッチテキストエディタで書ける。デフォルトはリッチテキストエディタ。
- 社内規則->各種申請書など、ファイルを添付できるようにしたいという要望がでている。(現在はリンクを Wiki 内に載せるということでカバーしている)
- Wiki に含まれているリンクは押せる必要がある
- Wiki は現在消せない仕様になっているが、削除機能を載せる要望は今後くるかもしれない
- Wiki は管理者もしくは書いた人のみが編集できる
- 社内規則のみ記述者の情報が必要ないため、Wiki 一覧にアバター画像の表示はありません

# 社員名鑑

- 要するにユーザー一覧/詳細
- その月のイベント参加数などを基準として社内で特定社員を表彰したりする可能性があるとのことで、イベント参加数順、質問数順、回答数順、ナレッジ投稿数順などでソートがかけられる。同様の理由で"週間","月間"などソート対象の期間も選べる
- ユーザーはタグを紐付けるだけではなく、技術/資格/部活動/趣味のそれぞれにおいて紹介文を記入できる(クライアント要望)
- 詳細画面では各ユーザーの参加したイベント/質問/ナレッジそれぞれ直近 20 件を取得できる

# チャット

基本的に 2021/12 時点での LINE にかなり仕様を寄せている

## ルーム

- チャットをする際は原則としてルームをつくる必要がある
- ルーム名はなくても可。ない場合はルーム名として、ルーム参加者の名前が羅列される
- ルーム退室時と誰かをルームに参加/退室させたときはその旨がシステムメッセージとして表示される
- ルームをピン留めすることで常にルーム一覧表示の最上部に表示できる
- ルームにはルーム画像をつけることができる。ルーム画像がない場合はデフォルト画像を表示する。一対一のチャットの場合は相手の画像を表示する
- **ルームの検索機能の要望あり**

## メッセージ

- メッセージの種類はテキスト、画像、動画、その他のファイル、システムメッセージ
- メッセージには@を接頭にしてメンションをつけることができる。ただしテキストメッセージのみ対応
- メッセージには返信をつけることができる。ただしテキストメッセージのみ対応。
- メッセージにはリアクションをつけることができる。😁 😭 👌 👍 👏 💪 ❤️' 🌹 🎉 💊 🙇 を選べる。クライアント指定。
- リアクションは誰でもつけることができるが、誰がどのリアクションを押したかを参照できるのは自分が送ったメッセージのみ
- チャットで送ったリンクは押せる必要がある
- **メッセージの検索機能の要望あり**

## アルバム

- ルームごとにアルバムを作成できる
- アルバムにはアルバム名と複数の画像を登録できる
- 誰でも追加、削除ができる(画像とアルバムの両方)

## ノート

- ルームごとにノートを作成できる
- ノートには文章(文字数制限なし)と画像を添付できる
- ノート作成者のみ編集、削除ができる

# 管理画面

## ユーザー管理

- 各ユーザーの社員区分の変更、ユーザーの削除(論理削除)ができる

## ユーザー作成

- 新規ユーザーを作成できる。作成時に該当メールアドレスにパスワードを記載したメールが送信される

## (ユーザー)タグ管理

- タグはイベントや Wiki につけるタグとユーザーにつけるタグで分かれている。(クライアント要望)
- 管理者以外は(ユーザー)タグ管理のみ閲覧可能(権限表参照)

## 特集管理

- "特集"はアプリのホーム画面上部に表示されるリンク集。
- 各種詳細画面のリンクとタイトルを登録でき、登録されたものをアプリで押下すると該当の詳細画面に遷移する

## CSV 出力

- 社員/イベントのデータを期間指定で取得できる
- 社員データには論理削除されたデータは含めない

# 勤怠管理

- すでに別システムを使用している。その別システムでは、案件の受託管理や会計/集計的な機能も備えている。その中から一般社員が使う勤怠管理部分のみを移行し、データはヴァレインで API を作って呼びだしてもらい、同期する。
- [既存の勤怠システムについてはユーザーマニュアルをいただけたのでこちらを参照](https://docs.google.com/presentation/d/1NV_IWaplabzLpRzsYgcEgjJ0IrBgugfP/edit?usp=sharing&ouid=106269405859163225620&rtpof=true&sd=true)

## 機能一覧

- [こちらを参照](https://docs.google.com/spreadsheets/d/1BreuNvn-dHcAyypycRki771pebAgg_izA0GsGjRYJA8/edit?usp=sharing)
- 勤怠入力(各社員自身で出勤時間、退勤時間、休憩時間を入力、保存)
- 欠勤申請(欠勤、休暇等の勤怠報告の申請)
- 非承認済み勤怠一覧(管理者によって承認されていない過去の勤怠報告の履歴を確認)
- 承認済み勤怠一覧(管理者によって承認済みの過去の勤怠報告の履歴を確認)
- 交通費申請(一般社員の稼働先までの交通費を保存)
- 入社前申請(面接での交通費など入社前に利用した経費の申請。)
- 勤怠情報取得(勤怠、欠勤、休暇の保存データを取得できる API 作成)
- 呼ぶことで勤怠情報を承認できるようにする API(既存の勤怠システムで承認した際に同じくデータを承認扱いにする APi 作成)
- 交通費情報取得(保存された交通費を取得)

# その他

# (ユーザー)タグ

- タグを選択する際にタグの名前で絞り込む機能の要望あり

## プロフィール編集

- 社員番号、社員区分以外を編集できる

## パスワードを忘れた人用の画面

- 入力されたメールアドレスに対して自動生成されたパスワードを記載したメールが送られる。この後ログインする際に使用されたパスワードが新しいパスワードとして採用される。(使われなかったパスワードは無効になる)

# システム構成

- フロントエンド Next.js / デプロイ先は Cloud Run(本番/デバッグ用)と Vercel(クライアントデモ用)
  デバッグ用の URL は以下  
  [デバッグ用サイト(Cloud run)](https://groupware-frontend-sgzkfl3uyq-an.a.run.app)  
  [客先にデモ用で見せているサイト(Vercel)](https://groupware-frontend-theta.vercel.app)
- バックエンド Nest.js / デプロイ先は Cloud Run
- モバイル React Native

**[デバッグの際は必ずこれに気をつける](https://www.infiniteloop.co.jp/blog/2021/09/unko/)**
