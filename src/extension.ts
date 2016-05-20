'use strict';
import {window, workspace, WorkspaceConfiguration, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "px2rem" is now active!');

    let configuration = new Configuration();

    window.showInformationMessage(`注意：当前项目的 html 元素的 font-size 为${configuration.getRem()}px。`);

    //当设置更改的时候，重置rem数值。
    workspace.onDidChangeConfiguration(configuration.setRemFromSetting, configuration);

    let disposable = commands.registerCommand('extension.px2rem', () => {

        let editor = window.activeTextEditor;
        let doc = editor.document;
        let selections = editor.selections;

        editor.edit(builder => {
            selections.forEach(selection => {
                let CursorPosition = selection.start;
                let wordRange = doc.getWordRangeAtPosition(CursorPosition);
                let selectedWord = doc.getText(wordRange);
                let matches = selectedWord.match(/(-?)([0-9]+)px/g);
                if (matches != null) {
                    let toRem = "";
                    matches.forEach(element => {
                        let value:number = <number>element.slice(0, element.lastIndexOf('px'));
                        toRem += `${}rem`;
                    });
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