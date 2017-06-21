# evaluate-bundle-webpack-plugin

Evaluates the freshly built bundle and executes a callback right before chunks are emitted. The callback is expected to return an object of additional chunks keyed by the relative chunk name.

## Usage

Add `evaluate-bundle-webpack-plugin` to the `plugins` section of your webpack config.

```js
const EvaluateBundlePlugin = require('evaluate-bundle-webpack-plugin');

module.exports = {
  // ...
  plugins: [
    new EvaluateBundlePlugin({
      callback: function(bundle, stats) {
        return {
          'robots.txt': 'User-agent: *\nDisallow:\n',
        };
      }
    }),
  ],
  // ...
};
```

### Configuration

| Option | Description |
|---|---|
| `callback` | Function that receives two parameters: the exports of the entrypoint of the evaluated bundle and the stats object from the compilation |

:warning: **This is in super alpha** :warning:
