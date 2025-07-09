import * as vscode from 'vscode';
import { capitalize } from './utils';
import { DiagnosticMessage } from './types';


function handleDiagnosticSelection(item: DiagnosticMessage | undefined): void {
  if (!item) return;

  vscode.workspace.openTextDocument(item.filePath)
    .then((doc) =>
      vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Active,
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

function buildDiagnosticMessages(severity?: vscode.DiagnosticSeverity): DiagnosticMessage[] {
  const diagnostics = vscode.languages.getDiagnostics();
  return diagnostics.flatMap(diagnostic =>
   diagnostic[1]
   .filter(diagnosticContent => severity === undefined || diagnosticContent.severity === severity)
   .map((diagnosticContent) => ({
      label: capitalize(diagnosticContent.message),
      detail: diagnostic[0].path,
      line: diagnosticContent.range.start,
      filePath: diagnostic[0]
    }))
  );
}

export function showDiagnosticsWindow(severity?: vscode.DiagnosticSeverity): void {
	  const presentableDiagnostics = buildDiagnosticMessages(severity);
      vscode.window
        .showQuickPick(presentableDiagnostics, {
          placeHolder: "Hop to a diagnostic!",
          canPickMany: false,
          matchOnDescription: true,
          matchOnDetail: true,
        })
        .then(handleDiagnosticSelection);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('DiagnosticHopper extension is now active!');
    const commands = [
      {
        id: "diagnostichopper.hopToDiagnostic",
        severity: undefined,
      },
      {
        id: "diagnostichopper.hopToError",
        severity: vscode.DiagnosticSeverity.Error,
      },
      {
        id: "diagnostichopper.hopToWarning",
        severity: vscode.DiagnosticSeverity.Warning,
      },
      {
        id: "diagnostichopper.hopToInfo",
        severity: vscode.DiagnosticSeverity.Information,
      },
      {
        id: "diagnostichopper.hopToHint",
        severity: vscode.DiagnosticSeverity.Hint,
      },
    ];
    
    commands.forEach(command => {
        const disposable = vscode.commands.registerCommand(command.id, () => {
            showDiagnosticsWindow(command.severity);
        });
        context.subscriptions.push(disposable);
    });
}

export function deactivate() {}
