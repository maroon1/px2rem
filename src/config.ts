import { workspace } from 'vscode';

class Configuration {
  get baseFontSize(): number {
    const configuration = workspace.getConfiguration('px2rem');
    return configuration.get<number>('htmlFontSize');
  }
}

export const config = new Configuration();
