import { TextRun } from "docx";
import { WordInlineChild } from "../../../../wordExport/WordTypes";
import { wordExportColors } from "@ext/wordExport/wordExportSettings";

export const kbdWordLayout: WordInlineChild = async ({ tag }) => {
	return await Promise.resolve([new TextRun({ text: tag.attributes.text, highlight: wordExportColors.codeBlocks })]);
};
