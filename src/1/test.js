const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require('fs');

const jscode = fs.readFileSync("../demo.js", {
    encoding: "utf-8"
});

let ast = parser.parse(jscode);

traverse(ast, {
    // Date.prototype.format
    MemberExpression(path) {
        // prototype,format
        if (t.isIdentifier(path.node.property)) {
            let name = path.node.property.name;
            // 只把property类型改为普通字符串StringLiteral
            // 具体的名字不变
            path.node.property = t.stringLiteral(name);
        }
        // computed表示以.的方式还是[]的方式
        // true表示使用[]方式
        path.node.computed = true;
    },
});


traverse(ast, {
    Identifier(path) {
        let name = path.node.name;
        if ('eval|parseInt|encodeURIComponent|Object|Function|Boolean|Number|Math|Date|String|RegExp|Array'.indexOf(name) != -1) {
            // 如果出现以上标识符将使用windows["xxx"]替换
            path.replaceWith(t.memberExpression(t.identifier('window'), t.stringLiteral(name), true));
        }
    }
});

let code = generator(ast).code;
fs.writeFile('./demo-new.js', code, (err) => { });
