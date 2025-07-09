import * as vscode from 'vscode';

export type DiagnosticMessage = {
    label: string;
    detail: string;
    line: vscode.Position;
    filePath: vscode.Uri;
};