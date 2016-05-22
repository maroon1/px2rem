'use strict';
import {window, TextEditor, Selection, Position, Range, workspace, WorkspaceConfiguration, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "px2rem" is now active!');

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
        convert.convertPx(wordSet,rem,'rem');
    });
    let rem2em = commands.registerCommand('extension.px2em', () => {
        let positions = what.getCursorPositions();
        let wordSet = what.getWordAtPosition(positions);
        let baseSize = 2;
        convert.convertPx(wordSet,baseSize,'em');
    });
    context.subscriptions.push(px2rem);
}

class Configuration {

    private _configuration: WorkspaceConfiguration;
    public rem: number;

    constructor() {
        this.setRemFromSetting();
    }

    public getRem(): number {
        return this.rem;
    }

    public setRemFromSetting() {
        this._configuration = workspace.getConfiguration("px2rem");
        this.rem = this._configuration.get('htmlFontSize', <number>24);
    }
}

class Convert {

    private _editor;
    private _configuration;

    constructor(configuration: Configuration) {
        this._editor = window.activeTextEditor;
        this._configuration = configuration;
    }

    public convertPx(wordSet: Word[],rem:number,unit: string) {
        this._editor.edit(builder => {

            wordSet.forEach(word => {
                let matches = word.value.match(/(-?)([0-9]+)px/g);
                if (matches != null) {
                    let toRem = "";
                    matches.forEach(element => {
                        let value = <any>(<any>element.slice(0, element.lastIndexOf('px')) / rem).toFixed(5) / 1;
                        toRem += `${value+unit}`;
                    });
                    builder.replace(new Selection(word.range.start, word.range.end), toRem);
                }
            });
        });
    }

    // public convertToEmByBaseSize(wordSet: Word[]) {
    //     this._editor.edit(builder => {
    //         let rem = this._configuration.getRem();
    //         let basefontsize = 2;
    //         wordSet.forEach(word => {
    //             let matches = word.value.match(/(-?)([0-9]+)(px)|(rem)/g);
    //             if (matches != null) {
    //                 let toEm = "";
    //                 matches.forEach(element => {
    //                     if (element.search('px')) {
    //                         let value = <any>(<any>element.slice(0, element.lastIndexOf('px')) / basefontsize).toFixed(5) / 1;
    //                         toEm += `${value}em`;
    //                     }
    //                     else {
    //                         let value = <any>(<any>element.slice(0, element.lastIndexOf('rem')) * rem / basefontsize).toFixed(5) / 1;
    //                         toEm += `${value}em`;
    //                     }
    //                 })
    //                 builder.replace(new Selection(word.range.start, word.range.end), toEm);
    //             }
                
    //         });
    //     });
    // }

}

class Word {
    public range: Range;
    public value: string;

    constructor(range: Range, value: string) {
        this.range = range;
        this.value = value;
    }
}

class What {

    private _editor: TextEditor;
    private _doc: TextDocument;

    constructor() {
        this._editor = window.activeTextEditor;
        this._doc = this._editor.document;
    }

    public getCursorPositions(isPrimaryCursor?: boolean) {

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

    public getWordAtPosition(positions: Position[]) {
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