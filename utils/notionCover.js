async function createUpload(notionKey) {
    try {
        const response = await fetch(
            'https://api.notion.com/v1/file_uploads',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${notionKey}`,
                    'Notion-Version': '2022-06-28',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            }
        );
        return response.json();
    } catch (error) {
        console.error('Error creating file upload:', error);
        throw error;
    }
}

async function uploadFile(formData, notionKey, pageId) {
    const file = await createUpload(notionKey);

    const response = await fetch(
        `https://api.notion.com/v1/file_uploads/${file.id}/send`,
        {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${notionKey}`,
                'Notion-Version': '2022-06-28',
            },
            mode: 'cors'
        }
    )

    try {
        if (response.ok) {
            const responseData = await patchCover(pageId, file.id, notionKey);
            return responseData;
        } else {
            const textResponse = await response.text();
            throw new Error(`Failed to upload file: ${textResponse}`);
        }
    } catch (error) {
        console.error("Failed to parse response as JSON:", error);
        throw new Error("Failed to process the response");
    }
}

async function patchCover(pageId, uploadId, notionKey) {
    console.log(uploadId)
    try {
        const response = await fetch(
            `https://api.notion.com/v1/pages/${pageId}`,
            {
                method: 'PATCH',
                body: {
                    // "cover": {
                    //     "type": "file_upload",
                    //     "file_upload": {
                    //         "id": `${uploadId}`
                    //     }
                    // }
                    "cover": {
                        "type": "external",
                        "external": {
                            "url": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1721670560i/208516656.jpg"
                        }
                    }
                },
                headers: {
                    'Authorization': `Bearer ${notionKey}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            }
        );
        return response.json();
    } catch (error) {
        console.error('Error updating cover:', error);
        throw error;
    }
}

export default uploadFile;