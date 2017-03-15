import { Range, Selection, TextEditor, window } from 'vscode';

import { Text } from './Text';

// 转换，用于单位的转换操作
export class Convert {
  private editor: TextEditor;

  constructor() {
    this.editor = window.activeTextEditor;
    window.onDidChangeActiveTextEditor((editor) => {
      this.editor = editor;
    }, this);
  }

  public convertPx(wordSet: Text[], factor: number, unit: string): void {
    let selections: Selection[] = [];
    this.editor.edit((builder) => {
      wordSet.forEach((word) => {
        let matches = word.value.match(/(-?)([0-9]+)px/g);
        let toRem = '';
        if (matches != null) {
          matches.forEach((element) => {
            let value = <any> (<any> element.slice(0, element.lastIndexOf('px')) / factor).toFixed(9) / 1;
            toRem += `${value + unit}`;
          });
          builder.replace(word.selection, toRem);
        }
        let section = word.selection.union(new Range(word.selection.start, word.selection.start.translate(0, toRem.length)));
        let cursorPosition = section.end;
        selections.push(new Selection(cursorPosition, cursorPosition));
      });
    });
    // 重设光标的位置
    this.editor.selections = selections;
  }
}
