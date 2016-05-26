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
        let rem = configuration.getRem();
        convert.convertPx(wordSet, rem, 'rem');
    });
    let rem2em = commands.registerCommand('extension.px2em', () => {
        let positions = what.getCursorPositions();
        let wordSet = what.getWordAtPosition(positions);
        let option: InputBoxOptions = {
            placeHolder: "请输入font-size的基准值",
            prompt: "可输入px值或rem值，当为px值时，可省略px。",
        }
        if (lastValue) {
            option.placeHolder += `（${lastValue}）`
        }
        window.showInputBox(option).then((value) => {
            let basefontsize;
            let basefontsize_temp
            // 验证输入
            // 按ESE则直接退出
            if (value === undefined) {
                return;
            }
            // 空输入且没有最后一个有效值返回
            if (value.length === 0 && !lastValue) {
                return;
            }
            if (value.length === 0) {
                basefontsize_temp = lastValue;
            } else {
                let matchs = value.match(/(\d+)(\s+)?(rem|px)?/);
                if (matchs !== null) {
                    lastValue = matchs[0];
                    basefontsize_temp = lastValue;
                }
            }
            basefontsize = <any>basefontsize_temp.match(/\d+/)[0];
            if (basefontsize_temp.match(/rem/)) {
                let rem = configuration.getRem();
                basefontsize = <any>basefontsize * rem;
            }
            convert.convertPx(wordSet, basefontsize, 'em');
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

    private _editor;
    private _configuration;

    constructor(configuration: Configuration) {
        this._editor = window.activeTextEditor;
        this._configuration = configuration;
        window.onDidChangeActiveTextEditor(editor => {
            this._editor = editor;
        },this)
    }

    public convertPx(wordSet: Word[], factor: number, unit: string): void {
        this._editor.edit(builder => {

            wordSet.forEach(word => {
                let matches = word.value.match(/(-?)([0-9]+)px/g);
                if (matches != null) {
                    let toRem = "";
                    matches.forEach(element => {
                        let value = <any>(<any>element.slice(0, element.lastIndexOf('px')) / factor).toFixed(5) / 1;
                        toRem += `${value + unit}`;
                    });
                    builder.replace(new Selection(word.range.start, word.range.end), toRem);
                }
            });
        });
    }
}

// 需要被转换的词的对象，包含有范围和值
class Word {
    public range: Range;
    public value: string;

    constructor(range: Range, value: string) {
        this.range = range;
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
        },this)
    }

    // 获得光标位置
    public getCursorPositions(isPrimaryCursor?: boolean): Position[] {

        let positions: Position[] = [];

        if (isPrimaryCursor) {
            positions.push(this._editor.selection.start);
        }
        else {
            this._editor.selections.forEach(selction => {
                positions.push(selction.start);
            });
        }

        return positions;
    }

    // 获得光标所在位置的词
    public getWordAtPosition(positions: Position[]): Word[] {
        let wordSet: Word[] = [];
        positions.forEach(position => {
            let wordRange = this._doc.getWordRangeAtPosition(position);
            let selectedWord = this._doc.getText(wordRange);

            let word = new Word(wordRange, selectedWord);
            wordSet.push(word);
        });
        return wordSet;
    }

}