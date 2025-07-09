import * as vscode from 'vscode';
import { capitalize } from './utils';
import { DiagnosticMessage } from './types';


function handleErrorSelection(item: DiagnosticMessage | undefined): void {
  if (!item) return;

  vscode.workspace.openTextDocument(item.filePath)
    .then((doc) => 
      vscode.window
        .showTextDocument(doc, {
          viewColumn: vscode.ViewColumn.Active,
          // preserveFocus: true,
        }))
        .then((editor) => {
          if (editor) {
            const position = item.line;
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(
              new vscode.Range(position, position),
              vscode.TextEditorRevealType.InCenter
            );
          }
        });
}

function buildDiagnosticMessages(): DiagnosticMessage[] {
  const diagnostics = vscode.languages.getDiagnostics();
  return diagnostics.flatMap((diagnostic) =>
    diagnostic[1].map((dMessage) => ({
      label: capitalize(dMessage.message),
      detail: diagnostic[0].path,
      line: dMessage.range.start,
      filePath: diagnostic[0],
    }))
  );
}

export function activate(context: vscode.ExtensionContext) {
    console.log('ErrorHopper extension is now active!');
    const disposable = vscode.commands.registerCommand('errorhopper.jumpToError', () => {
	  const presentableDiagnostics = buildDiagnosticMessages();
      vscode.window
        .showQuickPick(presentableDiagnostics, {
          placeHolder: "Hop to an error!",
          canPickMany: false,
          matchOnDescription: true,
          matchOnDetail: true,
        })
        .then(handleErrorSelection);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
