import { TextEditor, TextEditorEdit } from 'vscode';

import { config } from './config';
import { convert, getValidSelections } from './util';

export default function px2rem(textEditor: TextEditor, edit: TextEditorEdit) {
  const doc = textEditor.document;
  const selections = getValidSelections(textEditor, doc);

  if (selections.length === 0) {
    return;
  }

  textEditor.selections = selections;

  let factor = config.baseFontSize;

  convert(textEditor, edit, factor, 'rem');
}
