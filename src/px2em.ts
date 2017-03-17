import { InputBoxOptions, TextEditor, window } from 'vscode';

import { config } from './config';
import { convert, getValidSelections } from './util';

let regex = /^((?:\d*\.)?\d+)(rem|px)?$/;

function hasInvalidInput(text: string) {
  const hasPressESC = text === undefined;
  const isEmpty = text === '';
  const isUnknowInput = text.search(regex) === -1;
  if (hasPressESC || isEmpty || isUnknowInput) { return true; }
}

export default async function px2em(textEditor: TextEditor, lastValue: string | undefined) {
  const doc = textEditor.document;
  const selections = getValidSelections(textEditor, doc);

  if (selections.length === 0) { return; }

  textEditor.selections = selections;

  let option: InputBoxOptions = {
    placeHolder: '请输入font-size的基准值',
    prompt: '单位为px或rem，当单位为px时，可省略px。',
    value: lastValue,
  };

  let input = await window.showInputBox(option);
  if (hasInvalidInput(input)) { return; }

  let match = input.match(regex) as RegExpMatchArray;
  let factor = +match[1];
  let unit = match[2];

  if (!unit) { unit = 'px'; }
  lastValue = factor + unit;

  if (unit === 'rem') { factor *= config.baseFontSize; }

  textEditor.edit((edit) => {
    convert(textEditor, edit, factor, 'em');
  });

  return lastValue;
}
