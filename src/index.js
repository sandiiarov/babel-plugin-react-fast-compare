import { looksLike } from './helpers';

const LODASH = 'lodash';
const REACT_FAST_COMPARE = 'react-fast-compare';
const IS_EQUAL = 'isEqual';

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
        if (!looksLike(path, { parent: { source: { value: LODASH } } })) {
          return;
        }

        const { referencePaths } = path.scope.getBinding(path.node.local.name);

        referencePaths.forEach(({ parent, parentPath }) => {
          if (parent.property.name === IS_EQUAL) {
            file.set('hasIsEqual', true);
            parentPath.replaceWith(t.identifier(IS_EQUAL));
          }
        });
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
