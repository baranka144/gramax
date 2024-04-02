import { Article } from "@core/FileStructue/Article/Article";
import { Catalog } from "@core/FileStructue/Catalog/Catalog";
import { defaultLanguage } from "@ext/localization/core/model/Language";
import MarkdownParser from "@ext/markdown/core/Parser/Parser";
import ParserContextFactory from "@ext/markdown/core/Parser/ParserContext/ParserContextFactory";

export default class HtmlParser {
	constructor(private _markdownParser: MarkdownParser, private _parserContextFactory: ParserContextFactory) {}

	async parseToHtml(catalog: Catalog, article: Article): Promise<string> {
		try {
			return await this._markdownParser.parseToHtml(
				article.content,
				this._parserContextFactory.fromArticle(article, catalog, article.props.lang ?? defaultLanguage, true),
			);
		} catch (e) {
			return null;
		}
	}
}
