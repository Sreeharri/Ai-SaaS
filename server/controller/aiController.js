import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";

// Initialize the AI client with Gemini API key and base URL
const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Controller to generate an article using AI
export const generateArticle = async (req, res) => {
    try {
        // Get userId from Clerk's auth middleware
        const { userId } = req.auth();

        // Get prompt and length from the request body
        const { prompt, length } = req.body;

        // Get user's plan and free usage from the middleware
        const plan = req.plan;
        const free_usage = req.free_usage;

        // If user is not premium and has reached the free usage limit, block further requests
        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit has been reached. Upgrade to premium" });
        }

        // Call the AI API to generate the article
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            
            messages: [
                {
                    
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length
        });

        // Extract the generated content from the AI response
        const content = response.choices[0].message.content;

        // Save the creation to the database
        await sql`INSERT INTO creations(
            user_id, prompt, content, type
        ) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        // If user is not premium, increment their free usage count in Clerk
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        // Send the generated content back to the client
        res.json({ success: true, content });

        // Optionally log the AI response for debugging
        console.log(response.choices[0].message);

    } catch (error) {
        // Log the error and send a failure response
        console.log(error.message);
        res.json({ success: false, message: 'request failed' });
    }
}