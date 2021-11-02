const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require("fs");

function ConfoundUtils(ast, encryptFunc) {
	this.ast = ast;
	this.bigArr = [];
	this.encryptFunc = encryptFunc;
}
ConfoundUtils.prototype.changeAccessMode = function () {
	traverse(this.ast, {
		MemberExpression(path) {
			if (t.isIdentifier(path.node.property)) {
				let name = path.node.property.name;
				path.node.property = t.stringLiteral(name);
			}
			path.node.computed = true;
		},
	});
}
ConfoundUtils.prototype.changeBuiltinObjects = function () {
	traverse(this.ast, {
		Identifier(path) {
			let name = path.node.name;
			if ("eval|parseInt|encodeURIComponent|Object|Function|Boolean|Number|Math|Date|String|RegExp|Array".indexOf(name) != -1) {
				path.replaceWith(t.memberExpression(t.identifier("window"), t.stringLiteral(name), true));
			}
		}
	});
}
ConfoundUtils.prototype.numericEncrypt = function () {
	traverse(this.ast, {
		NumericLiteral(path) {
			let value = path.node.value;
			let key = parseInt(Math.random() * (999999 - 100000) + 100000, 10);
			let cipherNum = value ^ key;
			path.replaceWith(t.binaryExpression("^", t.numericLiteral(cipherNum), t.numericLiteral(key)));
			path.skip();
		}
	});
}
ConfoundUtils.prototype.arrayConfound = function () {
	let bigArr = [];
	let encryptFunc = this.encryptFunc;
	traverse(this.ast, {
		StringLiteral(path) {
			let bigArrIndex = bigArr.indexOf(encryptFunc(path.node.value));
			let index = bigArrIndex;
			if (bigArrIndex == -1) {
				let length = bigArr.push(encryptFunc(path.node.value));
				index = length - 1;
			}
			let encStr = t.callExpression(
				t.identifier("atob"),
				[t.memberExpression(t.identifier("arr"), t.numericLiteral(index), true)]);
			path.replaceWith(encStr);
		}
	});
	bigArr = bigArr.map(function (v) {
		return t.stringLiteral(v);
	});
	this.bigArr = bigArr;
}
ConfoundUtils.prototype.arrayShuffle = function () {
	(function (myArr, num) {
		var xiaojianbang = function (nums) {
			while (--nums) {
				myArr.unshift(myArr.pop());
			}
		};
		xiaojianbang(++num);
	}(this.bigArr, 0x10));
}
ConfoundUtils.prototype.binaryToFunc = function () {
	traverse(this.ast, {
		BinaryExpression(path) {
			let operator = path.node.operator;
			let left = path.node.left;
			let right = path.node.right;
			let a = t.identifier("a");
			let b = t.identifier("b");
			let funcNameIdentifier = path.scope.generateUidIdentifier("_0x");
			let func = t.functionDeclaration(
				funcNameIdentifier,
				[a, b],
				t.blockStatement([t.returnStatement(
					t.binaryExpression(operator, a, b)
				)]));
			let BlockStatement = path.findParent(
				function (p) { return p.isBlockStatement() });
			BlockStatement.node.body.unshift(func);
			path.replaceWith(t.callExpression(
				funcNameIdentifier, [left, right]));
		}
	});
}
ConfoundUtils.prototype.stringToHex = function () {
	function hexEnc(code) {
		for (var hexStr = [], i = 0, s; i < code.length; i++) {
			s = code.charCodeAt(i).toString(16);
			hexStr += "\\x" + s;
		}
		return hexStr
	}
	traverse(this.ast, {
		MemberExpression(path) {
			if (t.isIdentifier(path.node.property)) {
				let name = path.node.property.name;
				path.node.property = t.stringLiteral(hexEnc(name));
			}
			path.node.computed = true;
		}
	});
}
ConfoundUtils.prototype.renameIdentifier = function () {
	let code = generator(this.ast).code;
	let newAst = parser.parse(code);
	function generatorIdentifier(decNum) {
		let arr = ["O", "o", "0"];
		let retval = [];
		while (decNum > 0) {
			retval.push(decNum % 3);
			decNum = parseInt(decNum / 3);
		}
		let Identifier = retval.reverse().map(function (v) {
			return arr[v]
		}).join("");
		Identifier.length < 6 ? (Identifier = ("OOOOOO" + Identifier).substr(-6)) :
			Identifier[0] == "0" && (Identifier = "O" + Identifier);
		return Identifier;
	}
	function renameOwnBinding(path) {
		let OwnBindingObj = {}, globalBindingObj = {}, i = 0;
		path.traverse({
			Identifier(p) {
				let name = p.node.name;
				let binding = p.scope.getOwnBinding(name);
				binding && generator(binding.scope.block).code == path + "" ?
					(OwnBindingObj[name] = binding) : (globalBindingObj[name] = 1);
			}
		});
		for (let oldName in OwnBindingObj) {
			do {
				var newName = generatorIdentifier(i++);
			} while (globalBindingObj[newName]);
			OwnBindingObj[oldName].scope.rename(oldName, newName);
		}
	}
	traverse(newAst, {
		"Program|FunctionExpression|FunctionDeclaration"(path) {
			renameOwnBinding(path);
		}
	});
	this.ast = newAst;
}
ConfoundUtils.prototype.appointedCodeLineEncrypt = function () {
	traverse(this.ast, {
		FunctionExpression(path) {
			let blockStatement = path.node.body;
			let Statements = blockStatement.body.map(function (v) {
				if (t.isReturnStatement(v)) return v;
				if (!(v.trailingComments && v.trailingComments[0].value == "Base64Encrypt")) return v;
				delete v.trailingComments;
				let code = generator(v).code;
				let cipherText = base64Encode(code);
				let decryptFunc = t.callExpression(t.identifier("atob"), [t.stringLiteral(cipherText)]);
				return t.expressionStatement(
					t.callExpression(t.identifier("eval"), [decryptFunc]));
			});
			path.get("body").replaceWith(t.blockStatement(Statements));
		}
	});
}
ConfoundUtils.prototype.appointedCodeLineAscii = function () {
	traverse(this.ast, {
		FunctionExpression(path) {
			let blockStatement = path.node.body;
			let Statements = blockStatement.body.map(function (v) {
				if (t.isReturnStatement(v)) return v;
				if (!(v.trailingComments && v.trailingComments[0].value == "ASCIIEncrypt")) return v;
				delete v.trailingComments;
				let code = generator(v).code;
				let codeAscii = [].map.call(code, function (v) {
					return t.numericLiteral(v.charCodeAt(0));
				})
				let decryptFuncName = t.memberExpression(
					t.identifier("String"), t.identifier("fromCharCode"));
				let decryptFunc = t.callExpression(decryptFuncName, codeAscii);
				return t.expressionStatement(
					t.callExpression(t.identifier("eval"), [decryptFunc]));
			});
			path.get("body").replaceWith(t.blockStatement(Statements));
		}
	});
}
ConfoundUtils.prototype.unshiftArrayDeclaration = function () {
	this.bigArr = t.variableDeclarator(t.identifier("arr"), t.arrayExpression(this.bigArr));
	this.bigArr = t.variableDeclaration("var", [this.bigArr]);
	this.ast.program.body.unshift(this.bigArr);
}
ConfoundUtils.prototype.astConcatUnshift = function (ast) {
	this.ast.program.body.unshift(ast);
}
ConfoundUtils.prototype.getAst = function () {
	return this.ast;
}
function base64Encode(e) {
	return new Buffer.from(e).toString("base64");
}
function main() {
	const jscode = fs.readFileSync("../demo.js", {
		encoding: "utf-8"
	});
	const jscodeFront = fs.readFileSync("front.js", {
		encoding: "utf-8"
	});
	let ast = parser.parse(jscode);
	let astFront = parser.parse(jscodeFront);

	let confoundAst = new ConfoundUtils(ast, base64Encode);
	let confoundAstFront = new ConfoundUtils(astFront);

	confoundAst.changeAccessMode();
	confoundAst.changeBuiltinObjects();
	confoundAst.binaryToFunc()
	confoundAst.arrayConfound();
	confoundAst.arrayShuffle();

	confoundAstFront.stringToHex();
	astFront = confoundAstFront.getAst();
	confoundAst.astConcatUnshift(astFront.program.body[0]);

	confoundAst.unshiftArrayDeclaration();
	confoundAst.renameIdentifier();
	confoundAst.appointedCodeLineEncrypt();
	confoundAst.appointedCodeLineAscii();
	confoundAst.numericEncrypt();
	ast = confoundAst.getAst();
	code = generator(ast, {
		retainLines: false,
		comments: false,
		compact: true
	}).code;
	code = code.replace(/\\\\x/g, "\\x");
	fs.writeFile("demo-new.js", code, (err) => { });
}
main();