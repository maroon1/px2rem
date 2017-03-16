import { InputBoxOptions, TextEditor, TextEditorEdit, window } from 'vscode';

import { config } from './config';
import { convert, getValidSelections } from './util';

let regex = /^((?:\d*\.)?\d+)(rem|px)?$/;

function hasValidInput(text: string) {
  // 按了[ESC]退出
  if (text === undefined) { return false; }
  if (text === '') { return false; }
  if (text.search(regex) === -1) { return false; }
  return true;
}

export default function px2em(textEditor: TextEditor, edit: TextEditorEdit, lastValue: string | undefined) {
  const doc = textEditor.document;
  const selections = getValidSelections(textEditor, doc);

  if (selections.length === 0) { return; }

  textEditor.selections = selections;

  let option: InputBoxOptions = {
    placeHolder: '请输入font-size的基准值',
    prompt: '可输入px值或rem值，当为px值时，可省略px。',
    value: lastValue,
  };

  window.showInputBox(option)
    .then((input) => {
      if (!hasValidInput(input)) { throw '无效值'; }

      let match = input.match(regex) as RegExpMatchArray;
      let factor = +match[1];
      let unit = match[2];

      if (!unit) { unit = 'px'; }
      lastValue = factor + unit;

      if (unit === 'rem') { factor *= config.baseFontSize; }

      convert(textEditor, edit, factor, 'em');
    });

  return lastValue;
}
