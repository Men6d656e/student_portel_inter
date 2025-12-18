"use server"; // This tells Next.js to run this code on the server

export async function performOCR(base64Image: string) {
    console.log("Starting OCR process...",process.env.HF_TOKEN);
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/microsoft/trocr-base-handwritten",
            {
                headers: { 
                    Authorization: `Bearer ${process.env.HF_TOKEN}`, // Token stays safe on server
                    "Content-Type": "application/octet-stream" 
                },
                method: "POST",
                body: Buffer.from(base64Image, 'base64'),
            }
        );

        console.log("result:");
        const result = await response.json();
        console.log("result:", result);

        if (response.status === 503) {
            return { error: "loading", wait: result.estimated_time || 20 };
        }

        return { data: result[0]?.generated_text || "" };
    } catch (err) {
        return { error: "Failed to connect to Hugging Face" };
    }
}