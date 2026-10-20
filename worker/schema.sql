-- 答えを貯める表。保存するのは「答えた日（日本時間の日付だけ）・年代・9問の答え」だけ。
-- 名前・メールアドレス・地域・IPアドレス・ブラウザの情報は持たない。
-- 答えは「何番目の選択肢を選んだか」（0から数える）で持つ。点数ではなく選択肢で持つのは、Q2のように同じ点数の選択肢を分けて集計するため。
CREATE TABLE IF NOT EXISTS answers (
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT    NOT NULL,
  age INTEGER NOT NULL,
  q1 INTEGER NOT NULL, q2 INTEGER NOT NULL, q3 INTEGER NOT NULL,
  q4 INTEGER NOT NULL, q5 INTEGER NOT NULL, q6 INTEGER NOT NULL,
  q7 INTEGER NOT NULL, q8 INTEGER NOT NULL, q9 INTEGER NOT NULL
);

-- 開いた回数・答え始めた回数を、日付ごとの数だけで数える（2026-10-20 追加）。
-- 誰が開いたかは持たない。日付と種類と回数だけ。最後まで答えた数は answers の件数で数える。
CREATE TABLE IF NOT EXISTS events (
  day  TEXT    NOT NULL,
  kind TEXT    NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind)
);
