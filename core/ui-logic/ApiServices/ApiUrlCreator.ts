import { getExecutingEnvironment } from "@app/resolveModule/env";
import { Router } from "@core/Api/Router";
import DiagramType from "@core/components/Diagram/DiagramType";
import Theme from "@ext/Theme/Theme";
import Language from "@ext/localization/core/model/Language";
import MimeTypes from "./Types/MimeTypes";
import Url from "./Types/Url";

export default class ApiUrlCreator {
	constructor(
		private _basePath: string,
		private _lang?: Language,
		private _theme?: Theme,
		private _isLogged?: boolean,
		private _catalogName?: string,
		private _articlePath?: string,
		private _ssoServerUrl?: string,
	) {}

	fromArticle(articlePath: string) {
		return this.fromNewArticlePath(this._catalogName + "/" + articlePath);
	}

	fromNewArticlePath(articlePath: string) {
		return new ApiUrlCreator(
			this._basePath,
			this._lang,
			this._theme,
			this._isLogged,
			this._catalogName,
			articlePath,
		);
	}

	public getLogo(theme: Theme) {
		return Url.fromBasePath(
			theme == Theme.dark ? `/images/gramax-logo-dark.svg` : `/images/gramax-logo-light.svg`,
			getExecutingEnvironment() == "next" ? this._basePath : "",
		);
	}

	public getArticleResource(src: string, mimeType?: MimeTypes) {
		return Url.fromBasePath(`/api/article/resource/get`, this._basePath, {
			articlePath: this._articlePath,
			catalogName: this._catalogName,
			mimeType,
			src,
		});
	}

	public setSourceData() {
		return Url.fromBasePath(`/api/storage/setSourceData`, this._basePath);
	}

	public removeSourceData(sourceName: string) {
		return Url.fromBasePath(`/api/storage/removeSourceData`, this._basePath, { sourceName });
	}

	public initStorage() {
		return Url.fromBasePath(`/api/storage/init`, this._basePath, {
			articlePath: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public getArticleContentByRelativePath(articleRelativePath: string) {
		return Url.fromBasePath(`/api/article/features/getRenderContent`, this._basePath, {
			articleRelativePath,
			catalogName: this._catalogName,
			articlePath: this._articlePath,
		});
	}

	public setArticleResource(src: string, isBase64 = false) {
		return Url.fromBasePath(`/api/article/resource/set`, this._basePath, {
			articlePath: this._articlePath,
			catalogName: this._catalogName,
			isBase64: `${isBase64}`,
			src,
		});
	}

	public deleteArticleResource(src: string) {
		return Url.fromBasePath(`/api/article/resource/remove`, this._basePath, {
			articlePath: this._articlePath,
			catalogName: this._catalogName,
			src,
		});
	}

	public getArticleResourceNames() {
		return Url.fromBasePath(`/api/article/resource/getNames`, this._basePath, {
			articlePath: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public getNavigationUnresolvedCommentsCount() {
		return Url.fromBasePath(`/api/comments/getNavigationUnresolvedCommentsCount`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getCommentCount() {
		return Url.fromBasePath(`/api/comments/getCommentCount`, this._basePath, {
			catalogName: this._catalogName,
			articlePath: this._articlePath,
		});
	}

	public deleteComment(count: string) {
		return Url.fromBasePath(`/api/comments/deleteComment`, this._basePath, {
			catalogName: this._catalogName,
			articlePath: this._articlePath,
			count,
		});
	}

	public getAuthAssertUrl() {
		return Url.fromBasePath("/api/auth/assert", this._basePath);
	}

	public getSendMailTokenUrl(mail: string) {
		return Url.fromBasePath("/api/auth/sendMailToken", this._basePath, { mail });
	}

	public getFileUrl(url: string) {
		return Url.fromBasePath("/api/load/", this._basePath) + url;
	}

	public getDbDiagramUrl(path: string, primary: string, tags: string, draw?: string) {
		return Url.fromBasePath("/api/dbDiagram", this._basePath, {
			path: path,
			tags: tags,
			draw: draw,
			primary: primary,
			lang: this._lang,
			catalogName: this._catalogName,
			articlePath: this._articlePath,
		});
	}

	public getDiagram(src: string, diagramName: DiagramType, count: number = null) {
		return Url.fromBasePath(`/api/diagram/path`, this._basePath, {
			articlePath: this._articlePath,
			catalogName: this._catalogName,
			count: count?.toString(),
			diagram: diagramName,
			path: src,
		});
	}

	public getDiagramByContentUrl(diagramName: DiagramType, count: number = null) {
		return Url.fromBasePath(`/api/diagram/content`, this._basePath, {
			diagram: diagramName,
			count: count?.toString(),
		});
	}

	public getRedirectVScodeUrl() {
		return Url.fromBasePath("/api/vscode", this._basePath, { path: this._articlePath });
	}

	public getEditOnSourceLink(articlePath: string) {
		return Url.fromBasePath("/api/article/editOn/source", this._basePath, {
			catalogName: this._catalogName,
			articlePath,
		});
	}

	public getEditOnAppUrl(articlePath: string) {
		return Url.fromBasePath("/api/article/editOn/app", this._basePath, {
			catalogName: this._catalogName,
			articlePath,
		});
	}

	public getLogoUrl(catalogName: string) {
		return Url.fromBasePath(`/api/catalog/logo`, this._basePath, { catalogName, theme: this._theme });
	}

	public getOpenGraphLogoUrl(domain: string) {
		return domain + (this._basePath ?? "") + "/openGraph/logo.png";
	}

	public getAuthUrl(router: Router) {
		const from = encodeURIComponent(router?.basePath + router?.path);
		if (this._ssoServerUrl)
			return Url.from({
				pathname: `${this._ssoServerUrl}/${this._isLogged ? "logout" : "login"}?from=${from}`,
			});
		return Url.fromBasePath(this._isLogged ? `/api/auth/logout` : `/api/auth/login`, this._basePath, {
			from: from,
		});
	}

	public getWordSaveUrl(articlePath?: string) {
		return Url.fromBasePath(`/api/word${articlePath ? "" : "/all"}`, this._basePath, {
			l: this._lang,
			articlePath,
			catalogName: this._catalogName,
		});
	}

	public getGitAddUrl(filePaths: string[]) {
		return Url.fromBasePath(`/api/git/add`, this._basePath, {
			catalogName: this._catalogName,
			filePaths: JSON.stringify(filePaths),
		});
	}

	public getVersionControlResetBranchesUrl() {
		return Url.fromBasePath("/api/versionControl/branch/reset", this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getSyncCountUrl() {
		return Url.fromBasePath(`/api/storage/getSyncCount`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getStoragePublishUrl(message: string, recursive?: boolean) {
		return Url.fromBasePath(`/api/storage/publish`, this._basePath, {
			catalogName: this._catalogName,
			commitMessage: message,
			recursive: recursive.toString(),
		});
	}

	public getVersionControlDiscardUrl() {
		return Url.fromBasePath(`/api/versionControl/discard`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getVersionControlDiffItemsUrl() {
		return Url.fromBasePath(`/api/versionControl/diffItems`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getVersionControlFileStatus() {
		return Url.fromBasePath(`/api/versionControl/fileStatus`, this._basePath, {
			catalogName: this._catalogName,
			articlePath: this._articlePath,
		});
	}

	public getStorageFetch() {
		return Url.fromBasePath(`/api/storage/fetch`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getStorageHaveToPull() {
		return Url.fromBasePath(`/api/storage/haveToPull`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getStorageSyncUrl(recursive?: boolean) {
		return Url.fromBasePath(`/api/storage/sync`, this._basePath, {
			catalogName: this._catalogName,
			recursive: recursive.toString(),
		});
	}

	public getStorageCloneUrl(path: string, recursive = true, skipCheck?: boolean, branch?: string) {
		return Url.fromBasePath(`/api/storage/clone`, this._basePath, {
			recursive: recursive.toString(),
			branch,
			skipCheck: skipCheck.toString(),
			path,
		});
	}

	public getStorageCloneProgressUrl(path: string) {
		return Url.fromBasePath(`/api/storage/getCloneProgress`, this._basePath, {
			path,
		});
	}

	public getStorageUrl() {
		return Url.fromBasePath("/api/storage/getUrl", this._basePath, { catalogName: this._catalogName });
	}

	public getVersionControlCurrentBranchUrl({
		onlyName = true,
		cached = true,
	}: {
		onlyName?: boolean;
		cached?: boolean;
	} = {}) {
		return Url.fromBasePath(`/api/versionControl/branch/get`, this._basePath, {
			catalogName: this._catalogName,
			cached: cached.toString(),
			onlyName: onlyName.toString(),
		});
	}

	public getVersionControlCheckoutBranchUrl(branch: string) {
		return Url.fromBasePath(`/api/versionControl/branch/checkout`, this._basePath, {
			branch: encodeURIComponent(branch),
			catalogName: this._catalogName,
		});
	}

	public getVersionControlCreateNewBranchUrl(branch: string) {
		return Url.fromBasePath(`/api/versionControl/branch/create`, this._basePath, {
			branch: encodeURIComponent(branch),
			catalogName: this._catalogName,
		});
	}

	public getReviewLinkUrl(filePath: string) {
		return Url.fromBasePath(`/api/catalog/review/getReviewLink`, this._basePath, {
			catalogName: this._catalogName,
			filePath,
		});
	}

	public getReviewStorageDataUrl() {
		return Url.fromBasePath(`/api/catalog/review/getReviewLinkData`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getShareLinkUrl(filePath: string) {
		return Url.fromBasePath(`/api/catalog/share/getShareLink`, this._basePath, {
			catalogName: this._catalogName,
			filePath,
		});
	}

	public getShareLinkDataUrl() {
		return Url.fromBasePath(`/api/catalog/share/getShareLinkData`, this._basePath);
	}

	public getHealthcheckUrl() {
		return Url.fromBasePath(`/api/healthcheck`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getSearchDataUrl() {
		return Url.fromBasePath(`/api/plugin/plugins/search/searchCommand`, this._basePath);
	}

	public getVersionControlFileHistoryUrl() {
		return Url.fromBasePath(`/api/versionControl/fileHistory`, this._basePath, {
			path: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public mergeInto(branchName: string, deleteAfterMerge: boolean) {
		return Url.fromBasePath(`/api/versionControl/branch/mergeInto`, this._basePath, {
			catalogName: this._catalogName,
			branchName,
			deleteAfterMerge: deleteAfterMerge.toString(),
		});
	}

	public getFilesToMerge() {
		return Url.fromBasePath(`/api/versionControl/mergeConflict/getFiles`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public abortMergeSync(stashHash: string) {
		return Url.fromBasePath(`/api/storage/sync/mergeConflict/abort`, this._basePath, {
			catalogName: this._catalogName,
			stashHash,
		});
	}

	public resolveMergeSyncConflictedFiles(stashHash: string) {
		return Url.fromBasePath(`/api/storage/sync/mergeConflict/resolve`, this._basePath, {
			catalogName: this._catalogName,
			stashHash,
		});
	}

	public abortMergeBranch(theirsBranch: string) {
		return Url.fromBasePath(`/api/versionControl/branch/mergeConflict/abort`, this._basePath, {
			catalogName: this._catalogName,
			theirsBranch,
		});
	}

	public resolveMergeBranchConflictedFiles(
		theirsBranch: string,
		branchNameBefore: string,
		headBeforeMerge: string,
		deleteAfterMerge: boolean,
	) {
		return Url.fromBasePath(`/api/versionControl/branch/mergeConflict/resolve`, this._basePath, {
			catalogName: this._catalogName,
			theirsBranch,
			branchNameBefore,
			headBeforeMerge,
			deleteAfterMerge: deleteAfterMerge.toString(),
		});
	}

	public getVideoUrl(path: string) {
		return Url.fromBasePath("/api/elements/video/getUrl", this._basePath, {
			path: path,
			catalogName: this._catalogName,
			articlePath: this._articlePath,
		});
	}

	public getAddCommentUrl(query: { [name: string]: string }) {
		return Url.fromBasePath("/api/comments/VersionControl/addComment", this._basePath, query);
	}

	public editCommentUrl(query: { [name: string]: string }) {
		return Url.fromBasePath("/api/comments/VersionControl/editComment", this._basePath, query);
	}

	public getAddCommentAnswerUrl(query: { [name: string]: string }) {
		return Url.fromBasePath("/api/comments/VersionControl/addCommentAnswer", this._basePath, query);
	}

	public getEditCommentAnswerUrl(query: { [name: string]: string }) {
		return Url.fromBasePath("/api/comments/VersionControl/editCommentAnswer", this._basePath, query);
	}

	public getSetThemeURL(theme: string) {
		return Url.fromBasePath("/api/theme/set", this._basePath, { theme });
	}

	public createCatalog() {
		return Url.fromBasePath(`/api/catalog/create`, this._basePath);
	}

	public removeCatalog() {
		return Url.fromBasePath(`/api/catalog/remove`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public updateCatalogProps() {
		return Url.fromBasePath(`/api/catalog/updateProps`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public updateCatalogNav(logicPath: string) {
		return Url.fromBasePath(`/api/catalog/updateNavigation`, this._basePath, {
			logicPath,
			catalogName: this._catalogName,
		});
	}

	public getCatalogBrotherFileNames() {
		return Url.fromBasePath(`/api/catalog/getBrotherFileNames`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public createArticle(parentPath?: string) {
		return Url.fromBasePath(`/api/article/create`, this._basePath, {
			lang: this._lang,
			catalogName: this._catalogName,
			parentPath,
		});
	}

	public getItemProps(itemPath: string) {
		return Url.fromBasePath(`/api/article/getProps`, this._basePath, {
			catalogName: this._catalogName,
			path: itemPath,
		});
	}

	public updateArticleContent() {
		return Url.fromBasePath(`/api/article/updateContent`, this._basePath, {
			path: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public setArticleContent() {
		return Url.fromBasePath(`/api/article/features/setContent`, this._basePath, {
			path: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public getArticleContent() {
		return Url.fromBasePath(`/api/article/features/getContent`, this._basePath, {
			path: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public getLinkItems() {
		return Url.fromBasePath(`/api/article/features/getLinkItems`, this._basePath, {
			path: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public checkLastModifiedArticle() {
		return Url.fromBasePath(`/api/article/features/checkLastModified`, this._basePath, {
			path: this._articlePath,
			catalogName: this._catalogName,
		});
	}

	public getArticleBrotherFileNames(itemPath: string) {
		return Url.fromBasePath(`/api/article/features/getBrotherFileNames`, this._basePath, {
			path: itemPath,
			catalogName: this._catalogName,
		});
	}

	public getCustomArticle(name: string) {
		return Url.fromBasePath("/api/article/features/getCustomArticle", this._basePath, { name });
	}

	public removeItem(articlePath: string) {
		return Url.fromBasePath(`/api/item/remove`, this._basePath, {
			catalogName: this._catalogName,
			articlePath: articlePath,
		});
	}

	public updateItemProps() {
		return Url.fromBasePath(`/api/item/updateProps`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public getPermissionValuesUrl(path?: string) {
		return Url.fromBasePath(`/api/item/getPermission`, this._basePath, {
			catalogName: this._catalogName,
			path,
		});
	}

	public getShareTicket(group: string, date: string) {
		return Url.fromBasePath(`/api/catalog/share/getShareTicket`, this._basePath, {
			catalogName: this._catalogName,
			path: this._articlePath,
			group,
			date,
		});
	}

	public setPermissionValuesUrl(path?: string) {
		return Url.fromBasePath(`/api/item/setPermission`, this._basePath, {
			catalogName: this._catalogName,
			path,
		});
	}

	public pluginsAddLocals() {
		return Url.fromBasePath(`/api/plugin/addLocals`, this._basePath);
	}

	public pluginsInit() {
		return Url.fromBasePath(`/api/plugin/init`, this._basePath);
	}

	public getSnippetsListData() {
		return Url.fromBasePath(`/api/elements/snippet/getListData`, this._basePath, {
			catalogName: this._catalogName,
		});
	}

	public createSnippet() {
		return Url.fromBasePath(`/api/elements/snippet/create`, this._basePath, { catalogName: this._catalogName });
	}

	public removeSnippet(snippetId: string) {
		return Url.fromBasePath(`/api/elements/snippet/remove`, this._basePath, {
			catalogName: this._catalogName,
			snippetId,
		});
	}

	public getArticlesWithSnippet(snippetId: string) {
		return Url.fromBasePath(`/api/elements/snippet/getArticlesWithSnippet`, this._basePath, {
			catalogName: this._catalogName,
			snippetId,
		});
	}

	public editSnippet(oldSnippetId: string) {
		return Url.fromBasePath(`/api/elements/snippet/edit`, this._basePath, {
			catalogName: this._catalogName,
			oldSnippetId,
		});
	}

	public getSnippetEditData(snippetId: string) {
		return Url.fromBasePath(`/api/elements/snippet/getEditData`, this._basePath, {
			catalogName: this._catalogName,
			snippetId,
		});
	}

	public getSnippetRenderData(snippetId: string) {
		return Url.fromBasePath(`/api/elements/snippet/getRenderData`, this._basePath, {
			catalogName: this._catalogName,
			snippetId,
		});
	}
}
