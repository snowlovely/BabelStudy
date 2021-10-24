const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;

const jscode = fs.readFileSync("./demo.js", {
    encoding: "utf-8"
});

let ast = parser.parse(jscode);

let code = generator(ast).code;

// 是否压缩
// let code = generator(ast,{
//     retainLines:false,
//     comments:false,
//     compact:true
// }).code;

fs.writeFile("./demoNew.js", code, (err) => { });