'use strict';
import {window, TextEditor, Selection, Position, workspace, WorkspaceConfiguration, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "px2rem" is now active!');

    let configuration = new Configuration();
    let what = new What();

    window.showInformationMessage(`注意：当前项目的 html 元素的 font-size 为${configuration.getRem()}px。`);

    //当设置更改的时候，重置rem数值。
    workspace.onDidChangeConfiguration(configuration.setRemFromSetting, configuration);

    let disposable = commands.registerCommand('extension.px2rem', () => {

        let editor = window.activeTextEditor;
        let doc = editor.document;
        let selections = editor.selections;

        editor.edit(builder => {
            let rem = configuration.getRem();
            selections.forEach(selection => {
                let CursorPosition = selection.start;
                let wordRange = doc.getWordRangeAtPosition(CursorPosition);
                let selectedWord = doc.getText(wordRange);
                let matches = selectedWord.match(/(-?)([0-9]+)px/g);
                if (matches != null) {
                    let toRem = "";
                    matches.forEach(element => {
                        let value = <any>(<any>element.slice(0, element.lastIndexOf('px')) / rem).toFixed(5) / 1;
                        toRem += `${value}rem`;
                    });
                    builder.replace(new Selection(wordRange.start,wordRange.end),toRem);
                }
            });
        });

    });

    context.subscriptions.push(disposable);
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

    constructor(configuration: Configuration) {

    }


}

class What {

    private _editor: TextEditor;
    private _doc: TextDocument;

    constructor() {
        this._editor = window.activeTextEditor;
        this._doc = this._editor.document;
    }

    public getCursorPositions(isPrimary?: boolean) {

        let position: Position[] = [];

        if (isPrimary) {
            position.push(this._editor.selection.start);
        }
        else {
            this._editor.selections.forEach(selction => {
                position.push(selction.start);
            });
        }

        return position;
    }

}