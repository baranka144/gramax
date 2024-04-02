import Path from "@core/FileProvider/Path/Path";
import FileProvider from "@core/FileProvider/model/FileProvider";
import { Article } from "@core/FileStructue/Article/Article";
import FileStructure from "@core/FileStructue/FileStructure";
import MarkdownParser from "@ext/markdown/core/Parser/Parser";
import MarkdownFormatter from "@ext/markdown/core/edit/logic/Formatter/Formatter";
import { Tag } from "@ext/markdown/core/render/logic/Markdoc";
import SnippetEditorProps from "@ext/markdown/elements/snippet/edit/model/SnippetEditorProps.schema";
import SnippetEditData from "@ext/markdown/elements/snippet/model/SnippetEditData";
import SnippetRenderData from "@ext/markdown/elements/snippet/model/SnippetRenderData";

const SNIPPETS_FOLDER = ".snippets";

export default class SnippetProvider {
	private _snippetsPath: Path;
	private _snippetsArticles = new Map<string, Article>();

	constructor(private _fp: FileProvider, private _fs: FileStructure, private _catalogRootPath: Path) {
		this._snippetsPath = new Path([this._catalogRootPath.value, SNIPPETS_FOLDER]);
	}

	async create(snippetData: SnippetEditData, formatter: MarkdownFormatter) {
		return await this._setSnippet(snippetData, formatter);
	}

	async edit(oldSnippetId: string, snippetData: SnippetEditData, formatter: MarkdownFormatter) {
		await this._setSnippet(snippetData, formatter);
		if (oldSnippetId !== snippetData.id) await this.remove(oldSnippetId);
	}

	async remove(id: string) {
		this._snippetsArticles.delete(id);
		await this._fp.delete(this._getSnippetPath(id));
	}

	async getEditData(id: string, parser: MarkdownParser): Promise<SnippetEditData> {
		const article = await this._getSnippet(id);
		if (!article.parsedContent) article.parsedContent = await parser.parse(article.content);
		return { id, title: article.getTitle(), content: article.parsedContent.editTree };
	}

	async getRenderData(id: string, parser: MarkdownParser): Promise<SnippetRenderData> {
		const article = await this._getSnippet(id);
		if (!article.parsedContent) article.parsedContent = await parser.parse(article.content);
		return { id, title: article.getTitle(), content: (article.parsedContent.renderTree as Tag).children };
	}

	async getListData() {
		if (!(await this._fp.exists(this._snippetsPath))) return [];
		const entries = (await this._fp.readdir(this._snippetsPath)).map((e) => new Path(e));
		const data: SnippetEditorProps[] = [];
		for (const entry of entries) {
			const id = entry.name;
			const snippet = await this._getSnippet(id);
			data.push({ id, title: snippet.props.title });
		}
		return data;
	}

	private async _setSnippet(snippetData: SnippetEditData, formatter: MarkdownFormatter) {
		const snippetPath = this._getSnippetPath(snippetData.id);
		const article = this._createArticle(snippetPath, snippetData.title);
		await article.updateContent(await formatter.render(snippetData.content));
		this._snippetsArticles.set(snippetData.id, article);
	}

	private async _getSnippet(id: string) {
		if (this._snippetsArticles.has(id)) return this._snippetsArticles.get(id);
		const path = this._getSnippetPath(id);

		const { props, content } = this._fs.parseMarkdown(await this._fp.read(path), path);
		const lastModified = (await this._fp.getStat(path)).mtimeMs;

		const article = this._createArticle(path, props.title, lastModified, content);

		this._snippetsArticles.set(id, article);
		return this._snippetsArticles.get(id);
	}

	private _getSnippetPath(id: string): Path {
		return this._snippetsPath.join(new Path(`${id}.md`));
	}

	private _createArticle(path: Path, title: string, lastModified: number = new Date().getTime(), content?: string) {
		return new Article({
			ref: this._fs.getItemRef(path),
			parent: null,
			props: { title },
			content: content ?? "",
			logicPath: null,
			fs: this._fs,
			lastModified,
		});
	}
}
