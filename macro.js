'use strict';

const { createMacro } = require('babel-plugin-macros');
const { default: generator } = require('@babel/generator');
const { addNamed } = require('@babel/helper-module-imports');
const t = require('@babel/types');

/**
 * @param {babel.NodePath<babel.types.Program>} nodePath
 */
function addHelper(nodePath) {
  const ret = addNamed(nodePath, 'helper', 'magicfn');
  return ret;
}

module.exports = createMacro(({ references, state }) => {
  const helperImportName = addHelper(state.file.path);
  references.default.forEach(nodePath => {
    const { parentPath } = nodePath;
    if (parentPath.isCallExpression()) {
      /** @type {babel.NodePath<babel.types.FunctionExpression>} */
      const fnPath = parentPath.get('arguments')[0];
      const ast = t.callExpression(helperImportName, [
        t.stringLiteral(stringify(fnPath)),
      ]);
      parentPath.replaceWith(ast);
    }
  });
});

/**
 *
 * @param {babel.NodePath<babel.types.FunctionExpression>} nodePath
 */
function stringify(fn) {
  let { code } = generator(fn.node, {
    minified: true,
    comments: false,
  });
  return code;
}
