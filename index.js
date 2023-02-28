// 入口文件

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const ejs = require("ejs");
const { transformFromAst } = require("babel-core");

let id = 0

function createAsset(filePath) {
  // 1. 获取文件内容
  const source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  // 2. ast - 抽象语法树
  const ast = parser.parse(source, {
    sourceType: "module",
  });

  // 3. 解析ast树 获取依赖关系
  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });

  // 将es6 esmodule 转换为 es5的commonjs
  const { code } = transformFromAst(ast, null, {
    // 写完env需要装一个babel-preset-env
    presets: ['env'],
  });

  return {
    filePath,
    code,
    deps,
    mapping: {},
    id: id++
  };
}

// 将文件 ===》graph
function createGraph() {
  const mainAsset = createAsset("./example/main.js");

  const queue = [mainAsset]; 

  //  遍历依赖
  for (const assetPath of queue) {
    assetPath.deps.forEach((relativePath) => {
      // 得到一个相对路径
      const child = createAsset(path.resolve("./example", relativePath));
      assetPath.mapping[relativePath] = child.id

      queue.push(child);
    });
  }

  return queue;
}
const graph = createGraph();

// ejs进行处理
function build(graph) {
  const template = fs.readFileSync("./bundle.ejs", { encoding: "utf-8" });


  const data = graph.map((asset) => {
    return {
      id: asset.id,
      code: asset.code,
      mapping: asset.mapping
    }
  })
  console.log(data)
  const code = ejs.render(template, { data });

  fs.writeFileSync("./dist/bundle.js", code);
}

build(graph);
