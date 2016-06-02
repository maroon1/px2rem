'use strict';
import {window, InputBoxOptions, TextEditor, Selection, Position, Range, workspace, WorkspaceConfiguration, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "px2rem" is now active!');

    let lastValue: string;
    let configuration = new Configuration();
    let what = new What();
    let convert = new Convert(configuration);

    window.showInformationMessage(`注意：当前项目的 html 元素的 font-size 为${configuration.getRem()}px。`);

    //当设置更改的时候，重置rem数值。
    workspace.onDidChangeConfiguration(configuration.setRemFromSetting, configuration);

    let px2rem = commands.registerCommand('extension.px2rem', () => {
        let positions = what.getCursorPositions();
        let wordSet = what.getWordAtPosition(positions);
        if (wordSet.length === 0) {
            return;
        }
        let rem = configuration.getRem();
        convert.convertPx(wordSet, rem, 'rem');
    });
    let rem2em = commands.registerCommand('extension.px2em', () => {
        let positions = what.getCursorPositions();
        let wordSet = what.getWordAtPosition(positions);
        if (wordSet.length === 0) {
            return;
        }
        let option: InputBoxOptions = {
            placeHolder: "请输入font-size的基准值",
            prompt: "可输入px值或rem值，当为px值时，可省略px。",
        }
        if (lastValue) {
            option.placeHolder += `（${lastValue}）`
        }
        window.showInputBox(option).then((value) => {
            // 验证输入
            // 按ESE则直接退出
            if (value === undefined) {
                return;
            }
            // 定义一个用户输入的容器
            let userInput: string;
            if (value.length === 0) {
                // 空输入且没有最后一个有效值返回
                if (!lastValue) {
                    return;
                }
                // 如果有，把这个值作为用户输入值
                userInput = lastValue;
            }
            if (!userInput) {
                // 如果没有使用上一次的值，则使用用户输入的值
                userInput = value;
            }
            // 定义用户输入的结果
            let userInputResult;
            // 第一基础字体大小的容器
            let basefontsize;
            userInputResult = userInput.match(/^\d+(\.\d+)?$/);
            if (userInputResult !== null) {
                basefontsize = userInputResult[0];
                userInput = basefontsize + "px";
                convert.convertPx(wordSet, basefontsize, 'em');
            }
            else {
                if (userInput.search(/^\d+(\.\d+)?(\s+)?(rem)$/) !== -1) {
                    lastValue = userInput;
                    userInputResult = userInput.match(/^\d+(\.\d+)?/);
                    let rem = configuration.getRem();
                    basefontsize = <any>userInputResult[0] * rem;
                    convert.convertPx(wordSet, basefontsize, 'em');
                }
                else if (userInput.search(/^\d+(\.\d+)?(\s+)?(px)$/) !== -1) {
                    userInputResult = userInput.match(/^\d+(\.\d+)?/);
                    basefontsize = <any>userInputResult[0];
                    convert.convertPx(wordSet, basefontsize, 'em');
                }
                else {
                    return;
                }
            }
            // 如果输入的值可用，则保存这个输入值
            if (basefontsize) {
                lastValue = userInput;
            }
        });
    });
    context.subscriptions.push(px2rem);
}

// 配置，目前只用于设置rem值
class Configuration {

    private _configuration: WorkspaceConfiguration;
    public rem: number;

    constructor() {
        this.setRemFromSetting();
    }

    public getRem(): number {
        return this.rem;
    }

    public setRemFromSetting(): void {
        this._configuration = workspace.getConfiguration("px2rem");
        this.rem = this._configuration.get('htmlFontSize', <number>24);
    }
}

// 转换，用于单位的转换操作
class Convert {

    private _editor: TextEditor;
    private _configuration;

    constructor(configuration: Configuration) {
        this._editor = window.activeTextEditor;
        this._configuration = configuration;
        window.onDidChangeActiveTextEditor(editor => {
            this._editor = editor;
        }, this)
    }

    public convertPx(wordSet: Word[], factor: number, unit: string): void {
        let selections: Selection[] = [];
        this._editor.edit(builder => {
            wordSet.forEach(word => {
                let matches = word.value.match(/(-?)([0-9]+)px/g);
                let toRem = "";
                if (matches != null) {
                    matches.forEach(element => {
                        let value = <any>(<any>element.slice(0, element.lastIndexOf('px')) / factor).toFixed(9) / 1;
                        toRem += `${value + unit}`;
                    });
                    builder.replace(word.selection, toRem);
                }
                let section = word.selection.union(new Range(word.selection.start,word.selection.start.translate(0,toRem.length)));
                let cursorPosition = section.end;
                selections.push(new Selection(cursorPosition, cursorPosition));
            });
        });
        // 重设光标的位置
        this._editor.selections = selections;
    }
}

// 需要被转换的词的对象，包含有范围和值
class Word {
    selection: Selection;
    value: string;

    constructor(selection: Selection, value: string) {
        this.selection = selection;
        this.value = value;
    }
}

// 用于获得文档中的相关元素
class What {

    private _editor: TextEditor;
    private _doc: TextDocument;

    constructor() {
        this._editor = window.activeTextEditor;
        this._doc = this._editor.document;
        window.onDidChangeActiveTextEditor(editor => {
            this._editor = editor;
            this._doc = this._editor.document;
        }, this)
    }

    // 获得光标位置
    public getCursorPositions(isPrimaryCursor?: boolean): Position[] {

        let positions: Position[] = [];

        if (isPrimaryCursor) {
            positions.push(this._editor.selection.active);
        }
        else {
            this._editor.selections.forEach(selction => {
                positions.push(selction.active);
            });
        }

        return positions;
    }

    // 获得光标所在位置的词
    public getWordAtPosition(positions: Position[]): Word[] {
        let wordSet: Word[] = [];
        positions.forEach(position => {
            let wordRange = this._doc.getWordRangeAtPosition(position);
            if (!wordRange) {
                return wordSet;
            }
            let section = new Selection(wordRange.start, wordRange.end)
            let selectedWord = this._doc.getText(wordRange);

            let word = new Word(section, selectedWord);
            wordSet.push(word);
        });
        return wordSet;
    }

}