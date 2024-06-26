import { ItemRef } from "@core/FileStructue/Item/ItemRef";
import Path from "../../../../../logic/FileProvider/Path/Path";
import { Catalog } from "../../../../../logic/FileStructue/Catalog/Catalog";

const convertToSharePointDir = (catalog: Catalog, articleRef: ItemRef, path: string): Path => {
	if (!path) return Path.empty;
	const sharePointDirectory = catalog?.props.sharePointDirectory ?? catalog?.getName() ?? "";

	const sharePointPathParts =
		catalog
			?.getRootCategoryPath()
			.subDirectory(articleRef.path)
			?.parentDirectoryPath?.value?.split("/")
			.filter((p) => p) ?? [];

	sharePointPathParts?.unshift(sharePointDirectory);

	return new Path(sharePointPathParts).join(new Path(path));
};

export default convertToSharePointDir;
