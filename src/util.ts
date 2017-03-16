import { Range, Selection, TextDocument, TextEditor, TextEditorEdit } from 'vscode';

let regex = /(-)?\d*\.?\d+px/g;

function hasValidValue(text: string): boolean {
  return text.search(regex) !== -1;
}

export function getValidSelections(textEditor: TextEditor, doc: TextDocument) {
  const selections: Selection[] = [];

  Array.from(textEditor.selections)
    .map((selection): Range => {
      // 为空选择集自动选择光标所在位置的单词
      if (selection.isEmpty) {
        let position = selection.active;
        return doc.getWordRangeAtPosition(position);
      } else {
        return new Range(selection.start, selection.end);
      }
    })
    .filter((range) => {
      // 过滤掉无效的range（doc.getWordRangeAtPosition()可能返回undefined）
      return range;
    })
    .filter((range) => {
      // 过滤掉无效文本
      let text = doc.getText(range);
      return hasValidValue(text);
    })
    .forEach((range) => {
      // 为每个有效的文本建立单独的选择集
      let text = doc.getText(range);
      let result: RegExpExecArray | null;
      while ((result = regex.exec(text)) !== null) {
        let index = result.index;
        let start = range.start.translate(0, index);
        let end = range.start.translate(0, index + result[0].length);
        let selection = new Selection(start, end);
        selections.push(selection);
      }
    });

  return selections;
}

export function convert(textEditor: TextEditor, edit: TextEditorEdit, factor: number, unit: string) {
  const doc = textEditor.document;
  textEditor.selections.forEach((selection) => {
    let text = doc.getText(selection);
    let value = Number.parseFloat(text.replace('px', ''));
    let result = value / factor;
    let fixed = Number.parseFloat(result.toFixed(9));
    edit.replace(selection, fixed + unit);
  });
}
