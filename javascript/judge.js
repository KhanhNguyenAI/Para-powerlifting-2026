//ランダムで失敗時の画像を表示する

let item = [
    "../images/judges/judge01.png",
    "../images/judges/judge02.png",
    "../images/judges/judge03.png",
    "../images/judges/judge04.png",
  ]; //ランダムで表示するモノのパス
  
  //ランダムで表示する
  let random = Math.floor(Math.random() * item.length);
  let output = "<img class='d-block mx-auto' src=" + item[random] + " width = '80%' height = '80%'>";
  document.write(output);
  