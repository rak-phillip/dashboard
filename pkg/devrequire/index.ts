/* eslint-disable @typescript-eslint/no-require-imports */
import { ActionLocation, IPlugin } from '@shell/core/types';
import metadata from './package.json';

const run = (name: string, fn: () => unknown) => {
  try {
    return `${ name }: OK ${ JSON.stringify(fn()) }`;
  } catch (e: any) {
    return `${ name }: FAILED ${ e.message }`;
  }
};

export default function(plugin: IPlugin): void {
  plugin.metadata = metadata;

  plugin.addAction(ActionLocation.HEADER, {}, {
    tooltip: 'Dev require repro',
    icon:    'icon-warning',
    invoke:  () => {
      window.alert([
        run('lodash/cloneDeep, called', () => require('lodash/cloneDeep')({ a: 1 })),
        run('dayjs, property', () => typeof require('dayjs').isDayjs),
        run('dayjs, called', () => require('dayjs')(0).isValid()),
      ].join('\n'));
    },
  });
}
