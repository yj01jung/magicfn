'use strict';

const { createMacro } = require('babel-plugin-macros');
const { default: generator } = require('@babel/generator');
const { addNamed } = require('@babel/helper-module-imports');
const { expression: tempExpr } = require('@babel/template');
const t = require('@babel/types');

/**
 * @param {babel.NodePath<babel.types.Program>} nodePath
 */
function addHelper(nodePath) {
  const ret = addNamed(nodePath, 'custom', 'magicfn');
  return ret;
}
const ARROW = tempExpr.ast`()=>{}`;
const NORMAL = tempExpr.ast`function(){}`;

module.exports = createMacro(({ references, config, state }) => {
  const helperImportName = addHelper(state.file.path);
  references.default.forEach(nodePath => {
    const { parentPath } = nodePath;
    if (parentPath.isCallExpression()) {
      /** @type {babel.NodePath<babel.types.FunctionExpression>} */
      const fnPath = parentPath.get('arguments')[0];
      const ast = t.callExpression(helperImportName, [
        fnPath.type === 'FunctionExpression' ? NORMAL : ARROW,
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
