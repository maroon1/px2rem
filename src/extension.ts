'use strict';
import { commands, ExtensionContext, window } from 'vscode';

import { config } from './config';
import px2em from './px2em';
import px2rem from './px2rem';

export function activate(context: ExtensionContext) {
    let lastValue: string | undefined;

    window.showInformationMessage(`注意：当前项目的 html 元素的 font-size 为${config.htmlFontSize}px。`);

    let px2remCommand = commands.registerTextEditorCommand('extension.px2rem', (textEditor, edit) => {
        px2rem(textEditor, edit);
    });

    let px2emCommand = commands.registerTextEditorCommand('extension.px2em', async (textEditor, edit) => {
        let value = await px2em(textEditor, lastValue);
        if (value) {
            lastValue = value;
        }
    });

    context.subscriptions.push(px2remCommand, px2emCommand);
}
