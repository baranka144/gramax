import getApplication from "@app/node/app";
import getItemRef from "../../../logic/Library/test/getItemRef";
import Navigation from "../../navigation/catalog/main/logic/Navigation";
import SecurityRules from "./SecurityRules";
import User from "./User/User";

const getSecurityRulesData = async () => {
	const app = await getApplication();

	const user = new User();
	const nav = new Navigation();
	const sr = new SecurityRules(user, app.customArticlePresenter);

	const categoryTestCatalog = await app.lib.getCatalog("RulesCategoryTestCatalog");
	const catalogTestCatalog = await app.lib.getCatalog("RulseCatalogTestCatalog");
	const articleTestCatalog = await app.lib.getCatalog("RulseArticleTestCatalog");

	const categoryItemRef = getItemRef(categoryTestCatalog, "category/_index.md");
	const articleItemRef = getItemRef(articleTestCatalog, "category/testRules_en.md");

	return { nav, sr, articleItemRef, articleTestCatalog, catalogTestCatalog, categoryItemRef, categoryTestCatalog };
};

describe("Security Rules фильтрует приватные", () => {
	describe("item", () => {
		test("article", async () => {
			const { sr, nav, articleItemRef, articleTestCatalog } = await getSecurityRulesData();

			const filter = sr.getNavRules().itemRule;
			const item = articleTestCatalog.findArticleByItemRef(articleItemRef);
			const itemLink = (await nav.getCatalogNav(articleTestCatalog, item.logicPath))[0];
			expect(filter(articleTestCatalog, item, itemLink)).toEqual(false);
		});

		test("category", async () => {
			const { sr, nav, categoryItemRef, categoryTestCatalog } = await getSecurityRulesData();

			const filter = sr.getNavRules().itemRule;
			const item = categoryTestCatalog.findCategoryByItemRef(categoryItemRef);
			const itemLink = (await nav.getCatalogNav(categoryTestCatalog, item.logicPath))[0];
			expect(filter(categoryTestCatalog, item, itemLink)).toEqual(false);
		});
	});

	test("catalog", async () => {
		const { sr, nav, catalogTestCatalog } = await getSecurityRulesData();

		const filter = sr.getNavRules().catalogRule;
		const catalogLink = await nav.getCatalogLink(catalogTestCatalog);

		expect(filter(catalogTestCatalog, catalogLink)).toEqual(false);
	});

	test("relatedLinks", async () => {
		const { sr, nav, catalogTestCatalog } = await getSecurityRulesData();

		const filter = sr.getNavRules().relatedLinkRule;
		const relatedLinks = nav.getRelatedLinks(catalogTestCatalog);

		expect(filter(catalogTestCatalog, relatedLinks[0])).toEqual(false);
	});

	test("article", async () => {
		const { sr, articleItemRef, articleTestCatalog } = await getSecurityRulesData();

		const filter = sr.getItemFilter();
		const article = articleTestCatalog.findArticleByItemRef(articleItemRef);

		expect(filter(article, articleTestCatalog)).toEqual(false);
	});
});
