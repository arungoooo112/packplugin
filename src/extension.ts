import * as vscode from 'vscode';
import * as path from 'path';

class CommandFolder extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children: vscode.TreeItem[]
  ) {
    super(label, collapsibleState);
  }
}

class MyTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element instanceof CommandFolder) {
      return Promise.resolve(element.children);
    } else {
		const command1 = new vscode.TreeItem('Command 1', vscode.TreeItemCollapsibleState.None);
		const command2 = new vscode.TreeItem('Command 2', vscode.TreeItemCollapsibleState.None);
		const command3 = new vscode.TreeItem('Command 3', vscode.TreeItemCollapsibleState.None);
		command1.command = {
			command: 'extension.command1',
			title: 'Command 1'
		  };
		  command2.command = {
			command: 'extension.command2',
			title: 'Command 2'
		  };

		  command3.command = {
			command: 'extension.command3',
			title: 'Command 3'
		  };
		const commandFolder = new CommandFolder('Commands', vscode.TreeItemCollapsibleState.Expanded, [
        command1,
        command2,
		command3,
        // Add more commands here
      ]);
      return Promise.resolve([commandFolder]);
    }
  }
}

async function findLatestHtmlFile(): Promise<vscode.Uri | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
		console.log("folder", folder);
      const targetFolderPath = path.join(folder.uri.fsPath, 'target/folder');
      const htmlFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(targetFolderPath, '*.html')
      );
      const sortedFiles = htmlFiles.sort((a, b) => b.fsPath.localeCompare(a.fsPath));
      if (sortedFiles.length > 0) {
        return sortedFiles[0];
      }
    }
  }
  return undefined;
}

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new MyTreeDataProvider();
  const treeView = vscode.window.createTreeView('myTreeView', { treeDataProvider });
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.command1',()=> {
		vscode.window.showInformationMessage('extension.command1.');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.command2',()=> {
			vscode.window.showInformationMessage('extension.command2.');
		}));
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.command3', async (item: vscode.TreeItem) => {
      const latestHtmlFile = await findLatestHtmlFile();
      if (latestHtmlFile) {
        // Create and show the webview
        const panel = vscode.window.createWebviewPanel(
          'htmlPreview',
          'HTML Preview',
          vscode.ViewColumn.One,
          {}
        );
        // 读取本地的 HTML 文件内容
        const readHTMLPromise = vscode.workspace.fs.readFile(latestHtmlFile);

        // 将读取的 HTML 文件内容设置给 WebView
        readHTMLPromise.then(htmlContent => {
            panel.webview.html = htmlContent.toString();
        });
      } else {
        vscode.window.showInformationMessage('No HTML files found.');
      }
    })
  );
}


export function deactivate() {}