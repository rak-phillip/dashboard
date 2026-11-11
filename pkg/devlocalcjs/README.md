# devlocalcjs

Reproduces a local CommonJS file in `pkg/` stopping the whole dashboard under `yarn dev` (rancher/dashboard#19667,
head 6fe6b17350). `index.ts` calls `require('./legacy')`, and `legacy.js` uses `module.exports`.

## Fails: `yarn dev` serves the package from source

1. Start the dev server without excluding this package:

   ```sh
   API=https://<rancher-host> yarn dev
   ```

2. Open the dashboard. It stays on the loading spinner, for every page and every package, not just this one.
3. The browser console and the dev server log show:

   ```text
   ReferenceError: module is not defined
    > pkg/devlocalcjs/legacy.js:1:1
   ```

With webpack, `yarn dev` loaded the package and the header button worked.

## Works: the built package

1. Build and serve it:

   ```sh
   ./shell/scripts/build-pkg.sh devlocalcjs
   yarn serve-pkgs
   ```

2. Exclude it from the app and start the dev server:

   ```sh
   API=https://<rancher-host> EXCLUDES_PKG=rancher-components,harvester,devlocalcjs yarn dev
   ```

3. Developer Load `http://127.0.0.1:4500/devlocalcjs-0.1.0/devlocalcjs-0.1.0.umd.min.js`, change page without
   reloading, and click the ⓘ header icon. It alerts `OK legacy called`.

Why: `shell/vite/require-compat.mjs` turns `require('./legacy')` into an `import` under `yarn dev`, but nothing
converts `legacy.js` itself from CommonJS, so the browser runs `module.exports = ...` as an ES module. Packages from
`node_modules` are pre-bundled by Vite, which is why they don't hit this.
