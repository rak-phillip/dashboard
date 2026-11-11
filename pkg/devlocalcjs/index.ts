/* eslint-disable @typescript-eslint/no-require-imports */
import { ActionLocation, IPlugin } from '@shell/core/types';
import metadata from './package.json';

export default function(plugin: IPlugin): void {
  plugin.metadata = metadata;

  plugin.addAction(ActionLocation.HEADER, {}, {
    tooltip: 'Local CommonJS repro',
    icon:    'icon-info',
    invoke:  () => {
      try {
        window.alert(`OK ${ require('./legacy')() }`);
      } catch (e: any) {
        window.alert(`FAILED ${ e.message }`);
      }
    },
  });
}
