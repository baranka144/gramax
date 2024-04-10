import { ResponseKind } from "@app/types/ResponseKind";
import { AuthorizeMiddleware } from "@core/Api/middleware/AuthorizeMiddleware";
import { DesktopModeMiddleware } from "@core/Api/middleware/DesktopModeMiddleware";
import ReloadConfirmMiddleware from "@core/Api/middleware/ReloadConfirmMiddleware";
import { JSONContent } from "@tiptap/react";
import { Command } from "../../../types/Command";
import { checkConfluenceArticles, convertConfluenceToGramax } from "./convertToGramax";
import { getConfluenceArticles } from "./getConfluenceArticles";
import Context from "@core/Context/Context";
import ResourceUpdater from "@core/Resource/ResourceUpdater";

//данные для atlassian
const atlassianUrl = "https://yargynkin.atlassian.net";
const email = "gramax.team@ics-it.ru";
const token = "";

const importConfluence: Command<{ ctx: Context, atlassianUrl: string; email: string; token: string }, void> = Command.create({
	path: "imports/confluence",

	kind: ResponseKind.plain,

	middlewares: [new AuthorizeMiddleware(), new DesktopModeMiddleware(), new ReloadConfirmMiddleware()],

	async do({ ctx, atlassianUrl, email, token }) {
		const { lib, parser, parserContextFactory, formatter } = this._app;
		const fp = lib.getFileProvider();
		let base64AuthString = btoa(`${email}:${token}`);
		const articles = await getConfluenceArticles(atlassianUrl, base64AuthString); //fetch к сервису
		const unsupportedTypes = await checkConfluenceArticles(articles);
		//console.log(unsupportedTypes);
		const contents: { title: string, content: JSONContent }[] = convertConfluenceToGramax(articles);
		//console.log(contents);
		await this._commands.catalog.create.do({ props: { title: "confluence", url: "confluence" }, ctx });
		for (const article of contents){
			console.log(article.title);
			console.log(article.content);
			const md = await formatter.render(article.content)
			await this._commands.article.create.do({ ctx, catalogName: "confluence", articleTitle: article.title, markdown: md })
		}
		return;
	},

	params(ctx, q) {
		return { ctx, atlassianUrl: q.atlassianUrl, email: q.email, token: q.token };
	},
});

export default importConfluence;
