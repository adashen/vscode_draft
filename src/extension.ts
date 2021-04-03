"use strict";

import * as vscode from "vscode";
import * as child_process from "child_process";
import { ChildProcess } from "child_process";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
    console.log("Congratulations, your extension 'draft' is now active!");
    const draft: DraftExtension = new DraftExtension();
    context.subscriptions.push(draft);
    context.subscriptions.push(vscode.commands.registerCommand("draft.init", () => {
        return draft.initDraft();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("draft.create", () => {
        return draft.createDraft();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("draft.up", () => {
        return draft.uploadDraft();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("draft.connect", () => {
        return draft.connectDraft();
    }));
}

// tslint:disable-next-line:no-empty
export function deactivate(): void {
}

class DraftExtension {
    private _status: vscode.StatusBarItem;
    private _output: vscode.OutputChannel;
    private _terminal: vscode.Terminal;

    constructor() {
        this.initialize();
        this.log("Draft initialization completed.");
    }

    initialize(): void {
        this._status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this._output = vscode.window.createOutputChannel("Draft");
        this._terminal = vscode.window.createTerminal("Draft");
    }

    executeCLI(command: string, callback: Function): void {
        this._output.clear();
        const outputPane: vscode.OutputChannel = this._output;
        let errMsg: string = "";
        let args: string[] = command.split(" ");
        let p: ChildProcess = child_process.spawn("draft", args, { "cwd": vscode.workspace.rootPath });
        p.stdout.on("data", function (data: string | Buffer): void {
            outputPane.append(data.toString());
        });
        p.stderr.on("data", function(data: string | Buffer): void {
            errMsg += data.toString();
            outputPane.append(data.toString());
        });
        p.on("exit", function (code : number): void {
            if (code !== 0) {
                callback(false, errMsg);
            } else {
                callback(true);
            }
        });
    }

    initDraft(): void {
        vscode.window.showInformationMessage("draft initialized");
    }

    createDraft(): void {
        this.executeCLI("create", (succeeded: boolean, errMsg: string) => {
            if (succeeded) {
                vscode.window.showInformationMessage("draft created");
            } else {
                vscode.window.showErrorMessage(errMsg);
            }
        });
    }

    uploadDraft(): void {
        this.executeCLI("up", (succeeded: boolean, errMsg: string) => {
            if (succeeded) {
                vscode.window.showInformationMessage("draft uploaded");
            } else {
                vscode.window.showErrorMessage(errMsg);
            }
        });
    }

    connectDraft(): void {
        this._terminal.show();
        this._terminal.sendText("draft connect", true);
        // this.executeCLI("connect", (succeeded: boolean, errMsg: string) => {
        //     vscode.window.showInformationMessage("draft connect ended");
        //     vscode.window.showErrorMessage(errMsg);
        // });
    }

    log(message: string): void {
        console.log(message);
    }

    dispose(): void {
        this._status.dispose();
        this._output.dispose();
        this._terminal.dispose();
        this.log("Draft dispose invoked.");
    }
}