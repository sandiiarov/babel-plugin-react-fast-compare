const { transform } = require('@babel/core');

const config = {
  plugins: [require('./index')],
  babelrc: false,
  configFile: false,
};

test('with default import', () => {
  const source = `
    import _ from 'lodash';

    _.capitalize('foo');
    _.isEqual({ foo: 'baz', baz: 'foo' });
  `;

  expect(transform(source, config).code).toMatchSnapshot();
});

test('with named import', () => {
  const source = `
    import { capitalize, isEqual } from 'lodash';

    capitalize('foo');
    isEqual({ foo: 'baz', baz: 'foo' });
  `;

  expect(transform(source, config).code).toMatchSnapshot();
});

test('with default and named import', () => {
  const source = `
    import _, { isEqual } from 'lodash';

    _.capitalize('foo');
    isEqual({ foo: 'baz', baz: 'foo' });
  `;

  expect(transform(source, config).code).toMatchSnapshot();
});

test('with react-fast-compare', () => {
  const source = `
    import { capitalize } from 'lodash';
    import isEqual from 'react-fast-compare';

    _.capitalize('foo');
    isEqual({ foo: 'baz', baz: 'foo' });
  `;

  expect(transform(source, config).code).toMatchSnapshot();
});

test('with default import from lodash/isEqual', () => {
  const source = `
    import _capitalize from 'lodash/capitalize';
    import _isEqual from 'lodash/isEqual';

    _capitalize('foo');
    _isEqual({ foo: 'baz', baz: 'foo' });
  `;

  expect(transform(source, config).code).toMatchSnapshot();
});

test('with default import from lodash/lang/isEqual', () => {
  const source = `
    import _capitalize from 'lodash/capitalize';
    import _isEqual from 'lodash/isEqual';

    _capitalize('foo');
    _isEqual({ foo: 'baz', baz: 'foo' });
  `;

  expect(transform(source, config).code).toMatchSnapshot();
});
