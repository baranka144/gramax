import { ResponseKind } from "@app/types/ResponseKind";
import { AuthorizeMiddleware } from "@core/Api/middleware/AuthorizeMiddleware";
import Path from "@core/FileProvider/Path/Path";
import { GitStatus } from "@ext/git/core/GitWatcher/model/GitStatus";
import { Command } from "../../types/Command";

const fileStatus: Command<{ catalogName: string; articlePath: string }, GitStatus> = Command.create({
	path: "versionControl/fileStatus",

	kind: ResponseKind.json,

	middlewares: [new AuthorizeMiddleware()],

	async do({ catalogName, articlePath }) {
		if (!articlePath) return;
		const { lib } = this._app;
		const catalog = await lib.getCatalog(catalogName);
		if (!catalog?.repo.gvc) return;
		const relativeRepPath = catalog.getRelativeRepPath(new Path(articlePath));
		return catalog.repo.gvc.getFileStatus(relativeRepPath);
	},

	params(ctx, q) {
		return { ctx, catalogName: q.catalogName, articlePath: q.articlePath };
	},
});

export default fileStatus;
