import { Article } from "@app/commands/imports/confluence/fetchArticles";


enum SupportedTypes {
	doc = "doc",
	paragraph = "paragraph",
	text = "text",
	heading = "heading",
	bulletList = "bulletList",
	orderedList = "orderedList",
	listItem = "listItem",
	blockquote = "blockquote",
	expand = "expand",
	codeBlock = "codeBlock",
	panel = "panel",
	table = "table",
	tableRow = "tableRow",
	tableHeader = "tableHeader",
	tableCell = "tableCell"
}

type JSONContent = {
	type?: string;
	attrs?: Record<string, any>;
	content?: JSONContent[];
	marks?: {
		type: string;
		attrs?: Record<string, any>;
		[key: string]: any;
	}[];
	text?: string;
	[key: string]: any;
};

function convertConfluenceParagraphNode(paragraphNode: JSONContent): JSONContent {
	if (paragraphNode.marks) delete paragraphNode.marks; //убрать отступы в paragraph
	return paragraphNode;
}

function convertConfluenceTextNode(textNode: JSONContent): JSONContent {
	if (textNode.marks) {
		textNode.marks = textNode.marks.filter((element) => element.type == "strong" ||
			element.type == "em" ||
			//hash? newHref? resPath?
			element.type == "link");
		if (textNode.marks.length == 0) delete textNode.marks;
	};
	return textNode;
}

function convertConfluenceHeadingNode(headingNode: JSONContent): JSONContent {
	// id ? customID?
	return headingNode;
}

function convertConfluenceBulletListNode(bulletListNode: JSONContent): JSONContent {
	bulletListNode = {
		type: "bullet_list",
		attrs: { "tight": false },
		content: bulletListNode.content
	};
	return bulletListNode;
}

function convertConfluenceOrderedListNode(orderedListNode: JSONContent): JSONContent {
	orderedListNode.type = "ordered_list";
	orderedListNode.attrs["tight"] = false;
	return orderedListNode;
}

function convertConfluenceListItemNode(listItemNode: JSONContent): JSONContent {
	listItemNode.type = "list_item";
	return listItemNode;
}

function convertConfluenceBlockQuoteNode(blockQuoteNode: JSONContent): JSONContent {
	return blockQuoteNode;
}

function convertConfluenceExpandNode(expandNode: JSONContent): JSONContent {
	expandNode.type = "cut";
	expandNode.attrs = {
		"text": expandNode.attrs["title"],
		"expanded": "true",
		"isInline": false
	}
	return expandNode;
}

function convertConfluenceCodeBlockNode(codeBlockNode: JSONContent): JSONContent {
	codeBlockNode.type = "code_block";
	codeBlockNode.attrs = {
		"params": codeBlockNode.attrs["language"]
	}
	return codeBlockNode;
}

function convertConfluencePanelNode(panelNode: JSONContent): JSONContent {
	panelNode.type = "note";
	let type = "";
	switch (panelNode.attrs["panelType"]) {
		case "info":
			type = "info";
			break;
		case "error":
			type = "danger";
			break;
		case "note":
			type = "tip";
			break;
		case "warning":
			type = "note";
			break;
		default:
			type = "info";
			break;

	}
	panelNode.attrs = {
		"type": type,
		"title": ""
	}
	return panelNode;
}

function convertConfluenceTableNode(tableNode: JSONContent): JSONContent {
	if (tableNode.attrs) delete tableNode.attrs;
	if (tableNode.marks) delete tableNode.marks;
	return tableNode;
}

function convertConfluenceTableRowNode(tableRowNode: JSONContent): JSONContent {
	return tableRowNode;
}

function convertConfluenceTableHeaderNode(tableHeaderNode: JSONContent): JSONContent {
	if (!tableHeaderNode.attrs["colwidth"]) {
		tableHeaderNode.attrs["colwidth"]  = null;
	}
	return tableHeaderNode;
}

function convertConfluenceTableCellNode(tableCellNode: JSONContent): JSONContent {
	if (!tableCellNode.attrs["colwidth"]) {
		tableCellNode.attrs["colwidth"]  = null;
	}
	return tableCellNode;
}

function convertUnsupportedTypeNode(UnsupportedTypeNode: JSONContent): JSONContent {
	delete UnsupportedTypeNode.content;
	let excuseNode: JSONContent = {
		type: "note",
		attrs: {
			"type": "note",
        	"title": ""
		},
		content: [
			{
				type: "paragraph",
				content: [{
					type: "text",
					text: `К сожалению мы не поддерживаем экспорт элемента ${UnsupportedTypeNode.type}`
				}]
			}
		]
	}
	return excuseNode;
}

function convertConfluenceNodeToGramaxNode(confluenceNode: JSONContent): JSONContent | undefined {
	// завернуть ли doc в функцию
	if (confluenceNode.type == SupportedTypes.doc) return confluenceNode;
	if (confluenceNode.type == SupportedTypes.paragraph) return convertConfluenceParagraphNode(confluenceNode);
	if (confluenceNode.type == SupportedTypes.text) return convertConfluenceTextNode(confluenceNode);
	if (confluenceNode.type == SupportedTypes.heading) return convertConfluenceHeadingNode(confluenceNode);
	if (confluenceNode.type == SupportedTypes.bulletList) return convertConfluenceBulletListNode(confluenceNode);
	if (confluenceNode.type == SupportedTypes.orderedList) return convertConfluenceOrderedListNode(confluenceNode);
	if (confluenceNode.type == SupportedTypes.listItem) return convertConfluenceListItemNode(confluenceNode);
	if (confluenceNode.type == SupportedTypes.blockquote) return convertConfluenceBlockQuoteNode((confluenceNode));
	if (confluenceNode.type == SupportedTypes.expand) return convertConfluenceExpandNode((confluenceNode));
	if (confluenceNode.type == SupportedTypes.codeBlock) return convertConfluenceCodeBlockNode((confluenceNode));
	if (confluenceNode.type == SupportedTypes.panel) return convertConfluencePanelNode((confluenceNode));
	if (confluenceNode.type == SupportedTypes.table) return convertConfluenceTableNode((confluenceNode));
	if (confluenceNode.type == SupportedTypes.tableRow) return convertConfluenceTableRowNode((confluenceNode));
	if (confluenceNode.type == SupportedTypes.tableHeader) return convertConfluenceTableHeaderNode((confluenceNode));
	if (confluenceNode.type == SupportedTypes.tableCell) return convertConfluenceTableCellNode((confluenceNode));
	//console.log(confluenceNode.type);
	return convertUnsupportedTypeNode((confluenceNode));
}

function convertArticleConfToGramax(confluenceJSON: JSONContent): JSONContent {
	const gramaxJSON = convertConfluenceNodeToGramaxNode(confluenceJSON);
	if (confluenceJSON.content) {
		gramaxJSON.content = confluenceJSON.content.map((content: JSONContent) => {
			return convertArticleConfToGramax(content);
		});
	}
	return gramaxJSON;
}

export function convertConfluenceToGramax(confluenceArticles: Article[]): Article[] {
	const gramaxArticles: Article[] = confluenceArticles.map((article: Article) => {
		return {
			title: article.title,
			content: convertArticleConfToGramax(article.content)
		}
	})
	return gramaxArticles
}

export function checkConfluenceArticles(articles: Article[]): Set<string> {
    const unsupportedTypes: Set<string> = new Set();
    articles.map((article: Article) => {
        checkSingleArticle(article.content, unsupportedTypes);
    })
    return unsupportedTypes;
}

function checkSingleArticle(confluenceJSON: JSONContent, unsupportedTypes: Set<string>) {
    if (SupportedTypes[confluenceJSON.type] === undefined) {
        unsupportedTypes.add(confluenceJSON.type);
    }
    if (confluenceJSON.content) {
        confluenceJSON.content.forEach((content: JSONContent) => {
            checkSingleArticle(content, unsupportedTypes);
        });
    }
}