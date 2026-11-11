# lazycjs

Reproduces the first `import()` of a CommonJS module resolving empty in a package build (rancher/dashboard#19667,
head 6fe6b17350). The header button calls the shell's own `downloadFile()` (`@shell/utils/download`), which does
`(await import('file-saver')).default`.

1. Build and serve the package:

   ```sh
   ./shell/scripts/build-pkg.sh lazycjs
   yarn serve-pkgs
   ```

2. In a second terminal, keep the package out of the app so the built copy runs:

   ```sh
   API=https://<rancher-host> EXCLUDES_PKG=rancher-components,harvester,lazycjs yarn dev
   ```

3. Log in, go to Preferences, and turn on **Enable Extension developer features**.
4. Extensions → ⋮ → **Developer Load**, URL
   `http://127.0.0.1:4500/lazycjs-0.1.0/lazycjs-0.1.0.umd.min.js`, leave Persist unchecked.
5. Change page without reloading (header actions are read on route change). A download icon appears in the header.
6. Click it twice.

| Click | Expected (webpack) | Actual |
|---|---|---|
| 1 | Downloads `lazycjs-repro.txt` | `FAILED o is not a function` |
| 2 | Downloads | Downloads |

Reload the page to reset (the loaded chunk is cached until then).

Console check without the button, after step 5: `await lazyCjs()` gives `default=undefined` the first time and
`default=function` / `default=object` after that.

Why: Rolldown compiles `import('file-saver')` to
`Promise.resolve().then(() => __toESM(require("./…FileSaver.min.<hash>.js").default))`. The chunk runtime's `require`
(`shell/pkg/chunk-loader.mjs:40`) returns a Promise while the chunk is still loading, so `.default` is `undefined`.
`yarn dev` never shows this, because it serves `pkg/` from source.
