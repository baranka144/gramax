import { AuthorizeMiddleware } from "@core/Api/middleware/AuthorizeMiddleware";
import ReloadConfirmMiddleware from "@core/Api/middleware/ReloadConfirmMiddleware";
import Context from "@core/Context/Context";
import Path from "@core/FileProvider/Path/Path";
import Permission from "@ext/security/logic/Permission/Permission";
import { Command, ResponseKind } from "../../../types/Command";

const getShareTicket: Command<{ ctx: Context; catalogName: string; path: Path; date: Date; group: string }, string> =
	Command.create({
		path: "catalog/share/getShareTicket",

		kind: ResponseKind.plain,

		middlewares: [new AuthorizeMiddleware(), new ReloadConfirmMiddleware()],

		async do({ ctx, catalogName, path, group, date }) {
			const { lib, ticketManager } = this._app;
			const catalog = await lib.getCatalog(catalogName);
			const article = catalog.findItemByItemPath(path);
			const catalogPermission = catalog?.getNeededPermission();

			if (!catalogPermission.isWorked()) {
				throw new Error(
					"Не установленно ни одной приватной группы. Подробнее https://docs.ics-it.ru/doc-reader/catalog/private",
				);
			}
			const permission = group ? new Permission(group) : catalog?.getNeededPermission();
			const ticket = encodeURIComponent(ticketManager.getShareTicket(catalogName, permission, new Date(date)));

			return `${ctx.domain}/${await catalog.getPathname(article)}?t=${ticket}`;
		},

		params(ctx, q) {
			const catalogName = q.catalogName;
			const path = new Path(q.path);
			const group = q.group;
			const date = new Date(q.date);
			return { ctx, catalogName, path, group, date };
		},
	});

export default getShareTicket;