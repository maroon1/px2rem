import { workspace } from 'vscode';

class Configuration {
  get htmlFontSize(): number {
    return this.getConfiguration<number>('htmlFontSize');
  }

  get decimals(): number {
    return this.getConfiguration<number>('decimals');
  }

  get keepSelections(): boolean {
    return this.getConfiguration<boolean>('keepSelections');
  }

  private getConfiguration<T>(param) {
    return workspace.getConfiguration('px2rem').get<T>(param);
  }
}

export const config = new Configuration();
