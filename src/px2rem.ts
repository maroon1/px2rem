import { Range, Selection, TextEditor, TextEditorEdit } from 'vscode';

import { config } from './config';

let regex = /(-)?\d*\.?\d+px/g;

export default function px2rem(textEditor: TextEditor, edit: TextEditorEdit) {
  const selections = textEditor.selections;
  const resultSelections: Selection[] = [];
  if (selections.length === 0) { return; };

  const doc = textEditor.document;

  selections
    .map((selection): Range => {
      if (selection.isEmpty) {
        let position = selection.active;
        return doc.getWordRangeAtPosition(position);
      } else {
        return new Range(selection.start, selection.end);
      }
    })
    // 过滤掉无效的range（doc.getWordRangeAtPosition()可能返回undefined）
    .filter((range) => {
      return range;
    })
    .filter((range) => {
      let text = doc.getText(range);
      return hasValidValue(text);
    })
    .forEach((range) => {
      let text = doc.getText(range);
      let result: RegExpExecArray | null;
      while ((result = regex.exec(text)) !== null) {
        let index = result.index;
        let start = range.start.translate(0, index);
        let end = range.start.translate(0, index + result[0].length);
        let selection = new Selection(start, end);
        resultSelections.push(selection);
      }
    });

  if (resultSelections.length === 0) {
    return;
  }

  textEditor.selections = resultSelections;

  textEditor.selections.forEach((selection) => {
    let text = doc.getText(selection);
    let value = Number.parseFloat(text.replace('px', ''));
    let result = value / config.baseFontSize;
    let fixed = Number.parseFloat(result.toFixed(9));
    edit.replace(selection, `${fixed}rem`);
  });
}

function hasValidValue(text: string): boolean {
  return text.search(regex) !== -1;
}
