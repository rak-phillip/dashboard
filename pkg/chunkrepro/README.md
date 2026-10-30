# chunkrepro

Reproduces a bug in rancher/dashboard#19667: `loadChunksOnDemand` builds its `deps` map before `vite:css-post`
removes CSS-only chunks (`shell/pkg/chunk-loader.mjs:216`). When two lazy modules import the same stylesheet, `deps`
names a chunk that is never written. The build passes, but the lazy import fails once the extension is installed.

This branch is `4f1b24d8fa` plus this extension.

## Steps

1. Install dependencies, build the extension and serve it:

   ```
   yarn install --frozen-lockfile
   ./shell/scripts/build-pkg.sh chunkrepro
   yarn serve-pkgs
   ```

2. In a second terminal, start the dashboard:

   ```
   API=https://<rancher-host> EXCLUDES_PKG=rancher-components,harvester,chunkrepro yarn dev
   ```

   `EXCLUDES_PKG` is required. Without it `yarn dev` registers `pkg/chunkrepro` as a built-in served from source, which
   never uses the chunk loader, so the bug does not appear. The variable replaces the default list, so the first two
   names have to stay.

3. In Preferences, tick **Enable Extension developer features**.

4. On the Extensions page, open the ⋮ menu, choose **Developer Load** and enter:

   ```
   http://127.0.0.1:4500/chunkrepro-0.1.0/chunkrepro-0.1.0.umd.min.js
   ```

5. Go to another page without reloading the browser. The header only picks up new actions on a route change, and a
   reload drops the extension unless it was persisted.

6. Click the warning icon in the header.

## Expected result

The alert reports:

```
REJECTED: Could not load http://127.0.0.1:4500/chunkrepro-0.1.0/chunkrepro-0.1.0.umd.min.shared.BTbKgXpm.js
```

The `a` chunk loads from port 4500 and the `shared` chunk is not found. Firefox shows the 404 as
`NS_ERROR_CORRUPTED_CONTENT`.

The missing file can also be seen without a Rancher host:

```
grep -oE 'var deps = .*' dist-pkg/chunkrepro-0.1.0/chunkrepro-0.1.0.umd.min.js
ls dist-pkg/chunkrepro-0.1.0 | grep shared
```

The first command lists the `shared` chunk and the second prints nothing.

## Control

Remove `import './shared.css';` from `b.ts` and rebuild. No shared chunk is created, every `deps` entry is empty and
the alert reports `RESOLVED: a loaded`.
