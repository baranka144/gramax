import { ResponseKind } from "@app/types/ResponseKind";
import { AuthorizeMiddleware } from "@core/Api/middleware/AuthorizeMiddleware";
import { DesktopModeMiddleware } from "@core/Api/middleware/DesktopModeMiddleware";
import ReloadConfirmMiddleware from "@core/Api/middleware/ReloadConfirmMiddleware";
import { JSONContent } from "@tiptap/react";
import { Command } from "../../../types/Command";
import { checkConfluenceArticles, convertConfluenceToGramax } from "./convertToGrammax";
import { getConfluenceArticles } from "./fetchArticles";

//данные для atlassian
const atlassianUrl = "https://yargynkin.atlassian.net";
const email = "gramax.team@ics-it.ru";
const token = "";

const importConfluence: Command<{ atlassianUrl: string; email: string; token: string }, void> = Command.create({
	path: "imports/confluence",

	kind: ResponseKind.plain,

	middlewares: [new AuthorizeMiddleware(), new DesktopModeMiddleware(), new ReloadConfirmMiddleware()],

	async do({ atlassianUrl, email, token }) {
		const { lib } = this._app;
		const fp = lib.getFileProvider();

		let base64AuthString = btoa(`${email}:${token}`);

		const articles = await getConfluenceArticles(atlassianUrl, base64AuthString); //fetch к сервису
		const unsupportedTypes = await checkConfluenceArticles(articles);

		console.log(unsupportedTypes);
		const content = convertConfluenceToGramax(JSON.parse(articles[0].content) as JSONContent);

		console.log(content);
		const markdown = "\n\n";

		return;
	},

	params(_, q) {
		return { atlassianUrl: q.atlassianUrl, email: q.email, token: q.token };
	},
});

export default importConfluence;
