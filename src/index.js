const { parse } = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const { default: generate } = require("@babel/generator");
const fs = require("fs");
const log = require("babel-log");

const code = fs.readFileSync(__dirname + "/mock.ts", "utf-8");

const ast = parse(code, {
  sourceType: "module",
  plugins: ["typescript"],
});

traverse(ast, {
  enter(path) {
    if (path.node.type === "TSTypeAliasDeclaration") {
      path.node.type = "TSInterfaceDeclaration";
    }
    if (!!path.node.body && !!path.node.body[0]) {
      const property = path.node.body[0].typeAnnotation;
      const members = property.members;
      property.body = members;
      delete property.members;
      path.node.body[0].body = property;
      delete path.node.body[0].typeAnnotation;
      path.node.body[0].body.type = "TSInterfaceBody";
    }
  },
});

const result = generate(ast).code;

fs.writeFileSync(__dirname + "/result.json", JSON.stringify(ast));
fs.writeFileSync(__dirname + "/result.js", result);
