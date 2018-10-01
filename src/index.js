const LODASH = 'lodash';
const REACT_FAST_COMPARE = 'react-fast-compare';
const IS_EQUAL = 'isEqual';

const isPrimitive = val => val == null || /^[sbn]/.test(typeof val);

const looksLike = (a, b) =>
  a &&
  b &&
  Object.keys(b).every(bKey => {
    const bVal = b[bKey];
    const aVal = a[bKey];
    if (typeof bVal === 'function') {
      return bVal(aVal);
    }
    return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
  });

export default function(babel) {
  const { types: t } = babel;

  return {
    name: 'ast-transform',
    visitor: {
      Program: {
        enter(path, { file }) {
          file.set('hasIsEqual', false);
          file.set('hasReactFastCompare', false);

          const nodes = path.node.body.filter(({ type, source }) => {
            return (
              type === 'ImportDeclaration' &&
              source.value === REACT_FAST_COMPARE
            );
          });

          if (nodes.length > 0) {
            file.set('hasReactFastCompare', true);
          }
        },
        exit(path, { file }) {
          if (!file.get('hasReactFastCompare') && file.get('hasIsEqual')) {
            const identifier = t.identifier(IS_EQUAL);
            const importDefaultSpecifier = t.importDefaultSpecifier(identifier);
            const importDeclaration = t.importDeclaration(
              [importDefaultSpecifier],
              t.stringLiteral(REACT_FAST_COMPARE)
            );

            path.unshiftContainer('body', importDeclaration);
          }
        },
      },
      ImportDefaultSpecifier(path, { file }) {
        if (looksLike(path, { parent: { source: { value: LODASH } } })) {
          const { referencePaths } = path.scope.getBinding(
            path.node.local.name
          );

          referencePaths.forEach(({ parent, parentPath }) => {
            if (parent.property && parent.property.name === IS_EQUAL) {
              file.set('hasIsEqual', true);
              parentPath.replaceWith(t.identifier(IS_EQUAL));
            }
          });
        }

        if (
          looksLike(path, {
            parent: {
              source: {
                value: v => {
                  return (
                    v === `${LODASH}/${IS_EQUAL}` ||
                    v === `${LODASH}/lang/${IS_EQUAL}`
                  );
                },
              },
            },
          })
        ) {
          const { referencePaths } = path.scope.getBinding(
            path.node.local.name
          );

          referencePaths.forEach(node => {
            node.replaceWith(t.identifier(IS_EQUAL));
          });

          file.set('hasIsEqual', true);
          path.parentPath.remove();
        }
      },
      ImportSpecifier(path, { file }) {
        if (
          !looksLike(path, {
            node: { imported: { name: IS_EQUAL } },
            parent: { source: { value: LODASH } },
          })
        ) {
          return;
        }

        file.set('hasIsEqual', true);
        path.remove();
      },
    },
  };
}
