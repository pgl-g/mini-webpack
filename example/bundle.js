(function (modules) {
  function require(filePath) {
    // 存在一种映射关系
    const fn = modules[filePath];

    const module = {
      exports: {},
    };
    fn(require, module, module.exports);

    return module.exports;
  }

  require("./main.js");
})({
  "./foo.js": function (require, module, exports) {
    // foojs
    function foo() {
      console.log("foo");
    }

    module.exports = {
      foo,
    };
  },
  "./main.js": function (require, module, exports) {
    // mainjs

    const { foo } = require("./foo.js");

    foo();

    console.log("main.js");
  },
});
