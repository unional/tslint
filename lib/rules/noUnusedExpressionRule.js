"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require("../lint");
var ts = require("typescript");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoUnusedExpressionWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = "expected an assignment or function call";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoUnusedExpressionWalker = (function (_super) {
    __extends(NoUnusedExpressionWalker, _super);
    function NoUnusedExpressionWalker(sourceFile, options) {
        _super.call(this, sourceFile, options);
        this.expressionIsUnused = true;
    }
    NoUnusedExpressionWalker.prototype.visitExpressionStatement = function (node) {
        this.expressionIsUnused = true;
        _super.prototype.visitExpressionStatement.call(this, node);
        if (this.expressionIsUnused) {
            var expression = node.expression;
            var kind = expression.kind;
            var isValidStandaloneExpression = kind === ts.SyntaxKind.DeleteExpression
                || kind === ts.SyntaxKind.YieldExpression
                || kind === ts.SyntaxKind.AwaitExpression;
            var isValidStringExpression = kind === ts.SyntaxKind.StringLiteral
                && (expression.getText() === '"use strict"' || expression.getText() === "'use strict'");
            if (!isValidStandaloneExpression && !isValidStringExpression) {
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
        }
    };
    NoUnusedExpressionWalker.prototype.visitBinaryExpression = function (node) {
        _super.prototype.visitBinaryExpression.call(this, node);
        switch (node.operatorToken.kind) {
            case ts.SyntaxKind.EqualsToken:
            case ts.SyntaxKind.PlusEqualsToken:
            case ts.SyntaxKind.MinusEqualsToken:
            case ts.SyntaxKind.AsteriskEqualsToken:
            case ts.SyntaxKind.SlashEqualsToken:
            case ts.SyntaxKind.PercentEqualsToken:
            case ts.SyntaxKind.AmpersandEqualsToken:
            case ts.SyntaxKind.CaretEqualsToken:
            case ts.SyntaxKind.BarEqualsToken:
            case ts.SyntaxKind.LessThanLessThanEqualsToken:
            case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
                this.expressionIsUnused = false;
                break;
            default:
                this.expressionIsUnused = true;
        }
    };
    NoUnusedExpressionWalker.prototype.visitPrefixUnaryExpression = function (node) {
        _super.prototype.visitPrefixUnaryExpression.call(this, node);
        switch (node.operator) {
            case ts.SyntaxKind.PlusPlusToken:
            case ts.SyntaxKind.MinusMinusToken:
                this.expressionIsUnused = false;
                break;
            default:
                this.expressionIsUnused = true;
        }
    };
    NoUnusedExpressionWalker.prototype.visitPostfixUnaryExpression = function (node) {
        _super.prototype.visitPostfixUnaryExpression.call(this, node);
        this.expressionIsUnused = false;
    };
    NoUnusedExpressionWalker.prototype.visitBlock = function (node) {
        _super.prototype.visitBlock.call(this, node);
        this.expressionIsUnused = true;
    };
    NoUnusedExpressionWalker.prototype.visitArrowFunction = function (node) {
        _super.prototype.visitArrowFunction.call(this, node);
        this.expressionIsUnused = true;
    };
    NoUnusedExpressionWalker.prototype.visitCallExpression = function (node) {
        _super.prototype.visitCallExpression.call(this, node);
        this.expressionIsUnused = false;
    };
    NoUnusedExpressionWalker.prototype.visitConditionalExpression = function (node) {
        this.visitNode(node.condition);
        this.expressionIsUnused = true;
        this.visitNode(node.whenTrue);
        var firstExpressionIsUnused = this.expressionIsUnused;
        this.expressionIsUnused = true;
        this.visitNode(node.whenFalse);
        var secondExpressionIsUnused = this.expressionIsUnused;
        this.expressionIsUnused = firstExpressionIsUnused || secondExpressionIsUnused;
    };
    return NoUnusedExpressionWalker;
}(Lint.RuleWalker));
