const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require("fs");

const jscode = fs.readFileSync("demo.js", {
    encoding: "utf-8"
});
let ast = parser.parse(jscode);

function generatorIdentifier(decNum) {
    let flag = ["O", "o", "0"];
    let retval = [];
    // 类似三进制的一种做法
    while (decNum > 0) {
        retval.push(decNum % 3);
        decNum = parseInt(decNum / 3);
    }
    // 最终将retval反转遍历转换为flag中的字符即可得到新名字
    let Identifier = retval.reverse().map(function (v) {
        return flag[v]
    }).join("");
    // 小于6情况前面补O到恰好六位
    // 标识符不能以0开头所以加个O
    Identifier.length < 6 ? (Identifier = ("OOOOOO" + Identifier).substr(-6)) :
        Identifier[0] == "0" && (Identifier = "O" + Identifier);
    return Identifier;
}

function renameOwnBinding(path) {
    // 全局变量和本地变量
    // 这里的全局不是绝对的全局，可能是相对的全局例如父函数或window
    // 数组保存的内容是当前标识符引用到的name
    let OwnBindingObj = {}, globalBindingObj = {}, i = 0;
    path.traverse({
        Identifier(p) {
            // 当前标识符的名字
            let name = p.node.name;
            // 从当前作用域scope中拿到binding对象
            // 没有左值的是拿不到binding的一种情况
            let binding = p.scope.getOwnBinding(name);
            // 主要考虑是binding会拿到子函数内变量
            // 如果在同一个scope加入本地变量表否则加入全局变量表
            binding && generator(binding.scope.block).code == path + "" ?
                (OwnBindingObj[name] = binding) : (globalBindingObj[name] = 1);
        }
    });
    for (let oldName in OwnBindingObj) {
        // 如果和当前引用到的全局新名字重复继续生成
        var newName = generatorIdentifier(i++);
        while (globalBindingObj[newName]) {
            newName = generatorIdentifier(i++);
        }
        // scope.rename会把scope内所有标识符都rename
        OwnBindingObj[oldName].scope.rename(oldName, newName);
    }
    console.log(path+"")
    console.log("----------")
}
// 全局Program或函数
traverse(ast, {
    // 先以全局Program开始
    "Program|FunctionExpression|FunctionDeclaration"(path) {
        renameOwnBinding(path);
    }
});

let code = generator(ast).code;
fs.writeFile("./demo-new.js", code, (err) => { });
