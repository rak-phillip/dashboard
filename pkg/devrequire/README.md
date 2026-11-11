# devrequire

Reproduces `require()` of a callable CommonJS package failing under `yarn dev` (rancher/dashboard#19667, head
6fe6b17350). Package builds are fine; this only happens when `yarn dev` serves the package from source.

1. Start the dev server **without** excluding this package, so it runs from source:

   ```sh
   API=https://<rancher-host> yarn dev
   ```

2. Log in and open any page. A warning icon appears in the header.
3. Click it.

| Case | Webpack `yarn dev` | This PR `yarn dev` |
|---|---|---|
| `require('lodash/cloneDeep')({ a: 1 })` | OK | OK |
| `typeof require('dayjs').isDayjs` | OK | OK |
| `require('dayjs')(0).isValid()` | OK | `FAILED __rancher_require_module__(...) is not a function` |

Why: Vite's CommonJS interop turns dayjs into `{ ...dayjs, default: dayjs }`. dayjs has its own properties
(`extend`, `locale`, `isDayjs`, ...), so the object has more than one key, `__rancher_require_module__`
(`shell/vite/require-compat.mjs:39`) doesn't unwrap it, and the spread object isn't callable. `lodash/cloneDeep` has
no own properties, so it unwraps.
