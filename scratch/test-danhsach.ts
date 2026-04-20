async function run() {
  const url = "https://www.tiemtruyenchu.com/danh-sach?page=1&ajax=1";
  const res = await fetch(url);
  const data = await res.text();
  console.log("length:", data.length);
  console.log("text:", data.substring(0, 500));
}
run();
