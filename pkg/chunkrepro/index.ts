import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin } from '@shell/core/types';
import metadata from './package.json';

const loadChunk = () => import('./a')
  .then((m) => window.alert(`RESOLVED: ${ m.a }`))
  .catch((e) => window.alert(`REJECTED: ${ e.message }`));

export default function(plugin: IPlugin): void {
  importTypes(plugin);
  plugin.metadata = metadata;
  plugin.addAction(ActionLocation.HEADER, {}, {
    tooltip: 'Chunk repro',
    icon:    'icon-warning',
    invoke:  () => {
      loadChunk();
    },
  });
  (window as any).chunkReproA = () => import('./a');
  (window as any).chunkReproB = () => import('./b');
}
