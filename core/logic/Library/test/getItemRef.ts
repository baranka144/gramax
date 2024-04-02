import { ItemRef } from "@core/FileStructue/Item/ItemRef";
import Path from "../../FileProvider/Path/Path";
import { Catalog } from "../../FileStructue/Catalog/Catalog";

function getItemRef(catalog: Catalog, path: string): ItemRef {
	return {
		storageId: catalog.getRootCategory().ref.storageId,
		path: catalog.getRootCategoryPath().join(new Path(path)),
	};
}

export default getItemRef;
