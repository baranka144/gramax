import { JSONContent } from "@tiptap/react";

export interface Article {
    title: string;
    content: JSONContent;
}

export async function getConfluenceArticles(atlassianUrl, base64AuthString): Promise<Article[]> {
    const response = await fetch(`http://localhost:3000/json`, {
        headers: {
            Accept: 'application/json',
            Url: atlassianUrl,
            "Auth-String": base64AuthString
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as Promise<any>;
    const articles: Article[] = (await data).results.map((result: any) => ({
        title: result.title,
        content: JSON.parse(result.body.atlas_doc_format.value) as JSONContent,
    }));
    return articles;
}
