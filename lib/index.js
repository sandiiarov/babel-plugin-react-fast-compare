"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var LODASH = 'lodash';
var REACT_FAST_COMPARE = 'react-fast-compare';
var IS_EQUAL = 'isEqual';

var isPrimitive = function isPrimitive(val) {
  return val == null || /^[sbn]/.test(_typeof(val));
};

var looksLike = function looksLike(a, b) {
  return a && b && Object.keys(b).every(function (bKey) {
    var bVal = b[bKey];
    var aVal = a[bKey];

    if (typeof bVal === 'function') {
      return bVal(aVal);
    }

    return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
  });
};

function _default(babel) {
  var t = babel.types;
  return {
    name: 'ast-transform',
    visitor: {
      Program: {
        enter: function enter(path, _ref) {
          var file = _ref.file;
          file.set('hasIsEqual', false);
          file.set('hasReactFastCompare', false);
          var nodes = path.node.body.filter(function (_ref2) {
            var type = _ref2.type,
                source = _ref2.source;
            return type === 'ImportDeclaration' && source.value === REACT_FAST_COMPARE;
          });

          if (nodes.length > 0) {
            file.set('hasReactFastCompare', true);
          }
        },
        exit: function exit(path, _ref3) {
          var file = _ref3.file;

          if (!file.get('hasReactFastCompare') && file.get('hasIsEqual')) {
            var identifier = t.identifier(IS_EQUAL);
            var importDefaultSpecifier = t.importDefaultSpecifier(identifier);
            var importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral(REACT_FAST_COMPARE));
            path.unshiftContainer('body', importDeclaration);
          }
        }
      },
      ImportDefaultSpecifier: function ImportDefaultSpecifier(path, _ref4) {
        var file = _ref4.file;

        if (looksLike(path, {
          parent: {
            source: {
              value: LODASH
            }
          }
        })) {
          var _path$scope$getBindin = path.scope.getBinding(path.node.local.name),
              referencePaths = _path$scope$getBindin.referencePaths;

          referencePaths.forEach(function (_ref5) {
            var parent = _ref5.parent,
                parentPath = _ref5.parentPath;

            if (parent.property.name === IS_EQUAL) {
              file.set('hasIsEqual', true);
              parentPath.replaceWith(t.identifier(IS_EQUAL));
            }
          });
        }

        if (looksLike(path, {
          parent: {
            source: {
              value: function value(v) {
                return v === "".concat(LODASH, "/").concat(IS_EQUAL) || v === "".concat(LODASH, "/lang/").concat(IS_EQUAL);
              }
            }
          }
        })) {
          var _path$scope$getBindin2 = path.scope.getBinding(path.node.local.name),
              _referencePaths = _path$scope$getBindin2.referencePaths;

          _referencePaths.forEach(function (node) {
            node.replaceWith(t.identifier(IS_EQUAL));
          });

          file.set('hasIsEqual', true);
          path.parentPath.remove();
        }
      },
      ImportSpecifier: function ImportSpecifier(path, _ref6) {
        var file = _ref6.file;

        if (!looksLike(path, {
          node: {
            imported: {
              name: IS_EQUAL
            }
          },
          parent: {
            source: {
              value: LODASH
            }
          }
        })) {
          return;
        }

        file.set('hasIsEqual', true);
        path.remove();
      }
    }
  };
}