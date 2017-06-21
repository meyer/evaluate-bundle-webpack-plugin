const vm = require('vm');
const path = require('path');
const invariant = require('invariant');

function EvaluateBundlePlugin({ callback }) {
  this.renderCallback = callback;
}

EvaluateBundlePlugin.prototype.apply = function(compiler) {
  if (!this.renderCallback) {
    return;
  }

  compiler.plugin('emit', function(compilation, compileCallback) {
    let entryBundleName;

    // TODO: make sure this works with bundle splitting (it probably doesn't)
    for (const chunk of compilation.chunks) {
      if (chunk.hasRuntime()) {
        entryBundleName = chunk.files[0];
        break;
      }
    }

    const statsObj = compilation.getStats().toJson();

    const sourceAsset = compilation.assets[entryBundleName];
    const source = sourceAsset.source();

    const script = new vm.Script(source, {
      filename: path.join(compiler.outputPath, entryBundleName),
    });
    const context = vm.createContext({ console });

    let bundleExport;
    try {
      bundleExport = script.runInContext(context);
    } catch (e) {
      compilation.errors.push('EvaluateBundlePlugin: ' + e.stack);
    }
    const extraChunks = this.renderCallback(bundleExport, statsObj);

    // TODO: consider using module module
    // const Module = require('module');
    // const filePath = path.join(compiler.outputPath, entryBundleName);
    // const bundle = new Module();
    // bundle.paths = module.paths;
    // try {
    //   bundle._compile(source, filePath);
    // } catch (e) {
    //   compilation.errors.push('EvaluateBundlePlugin: ' + e.stack);
    // }
    // const extraChunks = this.renderCallback(bundle.exports, statsObj);

    invariant(
      typeof extraChunks === 'object' && extraChunks !== null,
      'EvaluateBundlePlugin callback must return an object'
    );

    for (const assetPath of Object.keys(extraChunks)) {
      compilation.assets[assetPath] = {
        source() {
          return extraChunks[assetPath];
        },
        size() {
          return extraChunks[assetPath].length;
        },
      };
    }

    compileCallback();
  });
};

module.exports = EvaluateBundlePlugin;
