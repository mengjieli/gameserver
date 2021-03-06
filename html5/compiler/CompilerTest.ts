
    import ts = require("typescript");

    function delint(sourceFile: ts.SourceFile) {
        delintNode(sourceFile);

        function delintNode(node: ts.Node) {
            switch (node.kind) {
                case ts.SyntaxKind.ForStatement:
                case ts.SyntaxKind.ForInStatement:
                case ts.SyntaxKind.WhileStatement:
                case ts.SyntaxKind.DoStatement:
                    if ((<ts.IterationStatement>node).statement.kind !== ts.SyntaxKind.Block) {
                        report(node, "A looping statement's contents should be wrapped in a block body.");
                    }
                    break;
                case ts.SyntaxKind.IfStatement:
                    var ifStatement = (<ts.IfStatement>node);
                    if (ifStatement.thenStatement.kind !== ts.SyntaxKind.Block) {
                        report(ifStatement.thenStatement, "An if statement's contents should be wrapped in a block body.");
                    }
                    if (ifStatement.elseStatement &&
                        ifStatement.elseStatement.kind !== ts.SyntaxKind.Block && ifStatement.elseStatement.kind !== ts.SyntaxKind.IfStatement) {
                        report(ifStatement.elseStatement, "An else statement's contents should be wrapped in a block body.");
                    }
                    break;

                case ts.SyntaxKind.BinaryExpression:
                    var op = (<ts.BinaryExpression>node).operator;

                    if (op === ts.SyntaxKind.EqualsEqualsToken || op === ts.SyntaxKind.ExclamationEqualsToken) {
                        report(node, "Use '===' and '!=='.")
                    }
                    break;
            }

            ts.forEachChild(node, delintNode);
        }

        function report(node: ts.Node, message: string) {
            var lineChar = sourceFile.getLineAndCharacterFromPosition(node.getStart());
            console.log(`${sourceFile.filename} (${lineChar.line},${lineChar.character}): ${message}`)
        }
    }

    var fileNames = [];
    var options: ts.CompilerOptions = { target: ts.ScriptTarget.ES6, module: ts.ModuleKind.AMD };
    var host = ts.createCompilerHost(options);
    var program = ts.createProgram(fileNames, options, host);

    program.getSourceFiles().forEach(delint);