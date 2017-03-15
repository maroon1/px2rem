import { Selection } from 'vscode';

export class Text {
    public selection: Selection;
    public value: string;

    constructor(selection: Selection, value: string) {
        this.selection = selection;
        this.value = value;
    }
}
