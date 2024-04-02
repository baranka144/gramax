import ParserContext from "./ParserContext/ParserContext";

import Markdoc, {
	Config,
	RenderableTreeNode,
	RenderableTreeNodes,
	Schema,
	Tag,
	Token,
	Tokenizer,
} from "../render/logic/Markdoc";

import getNodeElementRenderModels from "../render/logic/getRenderElements/getNodeElementRenderModels";
import getTagElementRenderModels from "../render/logic/getRenderElements/getTagElementRenderModels";

import { Content } from "@core/FileStructue/Article/Article";
import { getComponentsHTML } from "../render/components/getComponents/getComponents";
import MdParser from "./MdParser/MdParser";

import { Node } from "prosemirror-model";
import { ProsemirrorMarkdownParser, ProsemirrorTransformer } from "../edit/logic/Prosemirror";
import { schema } from "../edit/logic/Prosemirror/schema";
import { getTokens } from "../edit/logic/Prosemirror/tokens";

import commentNodeTransformer from "@ext/markdown/elements/comment/legacy/transformer/commentNodeTransformer";
import { JSONContent } from "@tiptap/core";
import getTocItems, { getLevelTocItemsByRenderableTree } from "../../../navigation/article/logic/createTocItems";
import inlineCutNodeTransformer from "../../elements/cut/edit/logic/inlineCutNodeTransformer";
import diagramsNodeTransformer from "../../elements/diagrams/logic/transformer/diagramsNodeTransformer";
import filesParserTransformer from "../../elements/file/edit/logic/filesParserTransformer";
import imageNodeTransformer from "../../elements/image/edit/logic/transformer/imageNodeTransformer";
import getBlockMdNodeTransformer from "../../elements/md/logic/getBlockMdNodeTransformer";
import emptyParagraphTransformer from "../../elements/paragraph/edit/logic/emptyParagraphTransformer";
import MarkdownFormatter from "../edit/logic/Formatter/Formatter";
import Transformer from "./Transformer/Transformer";

const katexPlugin = import("@traptitech/markdown-it-katex");

export type EditRenderableTreeNode = RenderableTreeNode | Node;

export default class MarkdownParser {
	public async parse(content: string, context?: ParserContext, requestUrl?: string): Promise<Content> {
		const schemes = this._getSchemes(context);
		const tokens = await this._getTokens(content, schemes);

		const renderTree = await this._getRenderableTreeNode(tokens, schemes, context);
		const editTree = await this._editParser(tokens, schemes, context);
		return {
			editTree,
			renderTree,
			htmlValue: await this.parseToHtml(content, context, requestUrl),
			tocItems: getTocItems(getLevelTocItemsByRenderableTree((renderTree as Tag)?.children ?? [])),
			linkManager: context?.getLinkManager(),
			resourceManager: context?.getResourceManager(),
			snippets: context?.snippet,
		};
	}

	public async editParse(content: string, context?: ParserContext): Promise<JSONContent> {
		const schemes = this._getSchemes(context);
		const tokens = await this._getTokens(content, schemes);
		return this._editParser(tokens, schemes, context);
	}

	public async parseToHtml(content: string, context?: ParserContext, requestUrl?: string): Promise<string> {
		return Markdoc.renderers.html(await this.parseRenderableTreeNode(content, context), {
			components: getComponentsHTML(requestUrl, context),
		});
	}

	public async parseRenderableTreeNode(
		content: string,
		context?: ParserContext,
		parserOptions?: ParserOptions,
	): Promise<RenderableTreeNodes> {
		const schemes = this._getSchemes(context);
		const tokens = await this._getTokens(content, schemes);
		const renderTreeNode = await this._getRenderableTreeNode(tokens, schemes, context);
		return parserOptions ? this._oneElementTransformer(renderTreeNode, parserOptions) : renderTreeNode;
	}

	public renderMarkdownIt(content: string) {
		return this.getRenderMarkdownIt(content);
	}

	public async getTokens(content: string, context: ParserContext): Promise<Token[]> {
		const schemes = this._getSchemes(context);
		return await this._getTokens(content, schemes);
	}

	public async getRenderMarkdownIt(content: string): Promise<string> {
		return (await this._getTokenizer()).renderToHtml(content);
	}

	private _oneElementTransformer(node: RenderableTreeNodes, parserOptions: ParserOptions): RenderableTreeNodes {
		const filter = (node: RenderableTreeNodes, name: string) => {
			if (Array.isArray(node)) return node.map((n) => filter(n, name));
			if (typeof node === "string") return node;
			if (node.name === name) return node.children;
			return node;
		};
		if (!parserOptions.isOneElement) return node;
		else node = filter(node, "article");
		if (parserOptions.isBlock) return node;
		else node = filter(node, "p");
		return node;
	}

	private _getSchemes(context?: ParserContext): Schemes {
		const tags: Record<string, Schema> = getTagElementRenderModels(context);
		const nodes: Record<string, Schema> = getNodeElementRenderModels(context);
		return { tags, nodes };
	}

	private async _getTokens(content: string, schemes?: Schemes) {
		const mdParser = new MdParser({ tags: schemes.tags });
		const parseDoc = mdParser.preParse(content);
		const tockens = (await this._getTokenizer()).tokenize(parseDoc);
		return new Transformer().tableTransform(tockens);
	}

	private async _getTokenizer() {
		const tokenizer = new Tokenizer({ linkify: true });
		tokenizer.use((await katexPlugin).default, { blockClass: "math-block", errorColor: " #cc0000" });
		return tokenizer;
	}
	private async _getRenderableTreeNode(
		tokens: Token[],
		schemes: Schemes,
		context?: ParserContext,
	): Promise<RenderableTreeNode> {
		const variables = context?.getProp("variables") ?? {};
		const config: Config = { nodes: schemes.nodes, tags: schemes.tags, variables };
		const ast = Markdoc.parse(tokens);
		return Markdoc.transform(ast, config);
	}

	private async _editParser(tokens: Token[], schemes: Schemes, context?: ParserContext): Promise<JSONContent> {
		const prosemirrorParser = new ProsemirrorMarkdownParser(schema, await this._getTokenizer(), getTokens(context));

		const transformer = new ProsemirrorTransformer({ ...schemes.tags, ...schemes.nodes }, [
			emptyParagraphTransformer,
			imageNodeTransformer,
			getBlockMdNodeTransformer(new MarkdownFormatter(), context),
			inlineCutNodeTransformer,
			filesParserTransformer,
			diagramsNodeTransformer,
			commentNodeTransformer,
		]);

		const transformTokens = transformer.transformToken(tokens);

		const editTree = (await prosemirrorParser.parse(transformTokens)).toJSON();

		const transformEditTree = await transformer.transformTree(editTree, null, null, context, 0);

		const finalEditTree = await transformer.transformMdComponents(
			transformEditTree,
			this.parseRenderableTreeNode.bind(this),
			context,
		);

		return finalEditTree;
	}
}

export function visit(tree: RenderableTreeNode, name: string, callback: (node: RenderableTreeNode) => void) {
	if (typeof tree !== "string") {
		if (tree.name === name) callback(tree);
		tree.children.forEach((children) => visit(children, name, callback));
	}
}

export interface ParserOptions {
	isOneElement?: boolean;
	isBlock?: boolean;
}

export interface Schemes {
	tags: Record<string, Schema>;
	nodes: Record<string, Schema>;
}
