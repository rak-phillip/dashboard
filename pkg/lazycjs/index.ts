import { ActionLocation, IPlugin } from '@shell/core/types';
import { downloadFile } from '@shell/utils/download';
import metadata from './package.json';

let clicks = 0;

const probe = async(name: string, load: () => Promise<any>) => {
  try {
    const m = await load();

    return `${ name }: default=${ typeof m?.default }`;
  } catch (e: any) {
    return `${ name }: REJECTED ${ e.message }`;
  }
};

export default function(plugin: IPlugin): void {
  plugin.metadata = metadata;

  plugin.addAction(ActionLocation.HEADER, {}, {
    tooltip: 'Lazy CommonJS repro',
    icon:    'icon-download',
    invoke:  async() => {
      clicks++;
      try {
        await downloadFile('lazycjs-repro.txt', 'hello');
        window.alert(`Click ${ clicks }: DOWNLOADED`);
      } catch (e: any) {
        window.alert(`Click ${ clicks }: FAILED ${ e.message }`);
      }
    },
  });

  (window as any).lazyCjs = async() => [
    await probe('file-saver', () => import('file-saver')),
    await probe('papaparse', () => import('papaparse')),
  ];
}
