const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require("fs");

const jscode = fs.readFileSync("./demo.js", {
    encoding: "utf-8"
});
let ast = parser.parse(jscode);

function base64Encode(e) {
    return new Buffer.from(e).toString("base64");
}

traverse(ast, {
    // 函数表达式
    FunctionExpression(path) {
        let blockStatement = path.node.body;
        // 遍历整个代码块
        let Statements = blockStatement.body.map(function (v) {
            if (t.isReturnStatement(v)) return v;
            // 如果不存在Base64Encrypt注释不处理
            if (!(v.trailingComments && v.trailingComments[0].value == "Base64Encrypt")) return v;
            // 删除注释
            delete v.trailingComments;
            let code = generator(v).code;
            let cipherText = base64Encode(code);
            // atob(BASE64_CODE);
            let decryptFunc = t.callExpression(t.identifier("atob"), [t.stringLiteral(cipherText)]);
            // eval(atob(BASE64_CODE));
            return t.expressionStatement(t.callExpression(t.identifier("eval"), [decryptFunc]));
        });
        path.get("body").replaceWith(t.blockStatement(Statements));
    }
});

traverse(ast, {
    enter(path) {
        t.removeComments(path.node);
    }
});

let code = generator(ast).code;
fs.writeFile("./demo-new.js", code, (err) => { });
