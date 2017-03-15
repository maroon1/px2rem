import { Position, Range, Selection, window } from 'vscode';

import { Text } from './Text';

/**
 * 根据选择集返回光标所在位置
 * @param selection - 选择集
 */
export function getPositionBySelection(selection: Selection): Position {
  return selection.active;
}

/**
 * 根据一组选择集返回光标所在位置
 * @param selections - 一组选择集
 */
export function getPositionsBySlections(selections: Selection[]): Position[] {
  return selections.map((selection) => getPositionBySelection(selection));
}

/**
 * 根据光标所在的位置来自动获取单词
 * @param position - 光标所在位置
 */
export function getWordByPostion(position: Position): Text {
  const doc = window.activeTextEditor.document;
  const range = doc.getWordRangeAtPosition(position);
  const selection = new Selection(range.start, range.end);
  const word = doc.getText(range);
  return new Text(selection, word);
}

/**
 * 根据选择集来获取文本
 * @param selection - 选择集
 */
export function getText(selection: Selection) {
  const doc = window.activeTextEditor.document;
  const range = new Range(selection.start, selection.end);
  const text = doc.getText(range);
  return new Text(selection, text);
}

/**
 * 根据一组光标所在的位置来自动获取一组单词
 * @param positions 一组光标所在位置
 */
export function getTextSetByPositions(positions: Position[]): Text[] {
  return positions.map((position) => getWordByPostion(position));
}

/**
 * 根据选择集来获取文本，空选择集将根据光标所在位置来自动获取文本
 * @param selection - 选择集
 */
export function getTextBySelection(selection: Selection): Text {
  if (selection.isEmpty) {
    const position = getPositionBySelection(selection);
    return getWordByPostion(position);
  }
  return getText(selection);
}

/**
 * 根据一组选择集来自动获取一组文本
 * @param selections 一组选择集
 */
export function getTextSetBySelections(selections: Selection[]): Text[] {
  return selections.map(((selection) => getTextBySelection(selection)));
}
