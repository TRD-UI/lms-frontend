// esbuild alias target for `hugeicons-react` when bundling src/data for the
// seed generator. The data modules import icon components for UI stats we do
// not seed; a CJS Proxy satisfies any named import without pulling in React.
module.exports = new Proxy({}, { get: () => () => null });
