import * from "http";

const server = http.createServer();
server.on("request", (request, response) => {
  console.log("respojn");
});
