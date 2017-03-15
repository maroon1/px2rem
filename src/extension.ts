'use strict';
import { commands, ExtensionContext, InputBoxOptions, Range, Selection, TextEditor, window } from 'vscode';

import { config } from './config';
import { Convert } from './Convert';
import { getTextSetBySelections } from './util';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "px2rem" is now active!');

    let lastValue: string;
    let convert = new Convert();

    window.showInformationMessage(`注意：当前项目的 html 元素的 font-size 为${config.baseFontSize}px。`);

    let px2rem = commands.registerCommand('extension.px2rem', () => {
        const editor = window.activeTextEditor;
        let wordSet = getTextSetBySelections(editor.selections);
        if (wordSet.length === 0) {
            return;
        }

        convert.convertPx(wordSet, config.baseFontSize, 'rem');
    });

    let rem2em = commands.registerCommand('extension.px2em', () => {
        const editor = window.activeTextEditor;
        let wordSet = getTextSetBySelections(editor.selections);
        if (wordSet.length === 0) {
            return;
        }

        let option: InputBoxOptions = {
            placeHolder: '请输入font-size的基准值',
            prompt: '可输入px值或rem值，当为px值时，可省略px。',
            value: lastValue,
        };

        window.showInputBox(option).then((value) => {
            // 验证输入
            // 按ESE则直接退出
            if (value === undefined) {
                return;
            }
            // 定义一个用户输入的容器
            let userInput: string = '';
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
                userInput = basefontsize + 'px';
                convert.convertPx(wordSet, basefontsize, 'em');
            }
            else {
                if (userInput.search(/^\d+(\.\d+)?(\s+)?(rem)$/) !== -1) {
                    lastValue = userInput;
                    userInputResult = userInput.match(/^\d+(\.\d+)?/);
                    basefontsize = <any> userInputResult[0] * config.baseFontSize;
                    convert.convertPx(wordSet, basefontsize, 'em');
                }
                else if (userInput.search(/^\d+(\.\d+)?(\s+)?(px)$/) !== -1) {
                    userInputResult = userInput.match(/^\d+(\.\d+)?/);
                    basefontsize = <any> userInputResult[0];
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
