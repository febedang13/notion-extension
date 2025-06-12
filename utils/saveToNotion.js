async function saveToNotion(bodyData, notionKey) {

    // const response = await notion.databases.query({
    //     database_id: databaseId,
    //     filter: {
    //         property: "Author(s)",
    //         multi_select: {
    //             contains: "Liane Moriarty"
    //         }
    //     }
    // });

    const response = await fetch(`https://api.notion.com/v1/pages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${notionKey}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
            
        },
        mode: "cors",
        body: JSON.stringify(bodyData),
    });
    
    try {
        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        } else {
            const textResponse = await response.text();
            throw new Error(`Failed to post to Notion: ${textResponse}`);
        }
    } catch (error) {
        console.error("Failed to parse response as JSON:", error);
        throw new Error("Failed to process the response");
    }
}

export default saveToNotion;