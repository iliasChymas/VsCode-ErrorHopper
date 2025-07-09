import * as vscode from 'vscode';
import { capitalize } from './utils';
import { DiagnosticMessage } from './types';


function handleDiagnosticSelection(item: DiagnosticMessage | undefined): void {
  if (!item) return;

  vscode.workspace.openTextDocument(item.filePath)
    .then((doc) =>
      vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Active,
        // preserveFocus: true,
      })
    )
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
    console.log('DiagnosticHopper extension is now active!');
    const disposable = vscode.commands.registerCommand('diagnostichopper.jumpToDiagnostic', () => {
	  const presentableDiagnostics = buildDiagnosticMessages();
      vscode.window
        .showQuickPick(presentableDiagnostics, {
          placeHolder: "Hop to a diagnostic!",
          canPickMany: false,
          matchOnDescription: true,
          matchOnDetail: true,
        })
        .then(handleDiagnosticSelection);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
