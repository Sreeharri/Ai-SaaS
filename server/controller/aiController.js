import FormData from 'form-data';
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary'


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

export const generateBlogTitle = async (req, res) => {
    try {
        // Get userId from Clerk's auth middleware
        const { userId } = req.auth();

        // Get prompt and length from the request body
        const { prompt} = req.body;

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
            max_tokens: 100,
        });

        // Extract the generated content from the AI response
        const content = response.choices[0].message.content;

        // Save the creation to the database
        await sql`INSERT INTO creations(
            user_id, prompt, content, type
        ) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

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


export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium users" });
        }

        // Generate image from ClipDrop
        const formData = new FormData();
        formData.append('prompt', prompt);

        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                ...formData.getHeaders(),
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
            responseType: "arraybuffer"
        });

        console.log("ClipDrop image buffer length:", data.length);

        // Convert image buffer to base64
        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        // Create signature for signed upload
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            { timestamp },
            process.env.CLOUDINARY_API_SECRET
        );

        // Upload image to Cloudinary using signed upload
        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            timestamp,
            api_key: process.env.CLOUDINARY_API_KEY,
            signature,
        });

        // Store creation in DB
        await sql`INSERT INTO creations(
            user_id, prompt, content, type, publish
        ) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        // Send image URL to client
        res.json({ success: true, content: secure_url });

        console.log("Image generated and uploaded to Cloudinary:", secure_url);

    } catch (error) {
        console.error("Error stack:", error.stack);
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("Error response status:", error.response.status);
            console.error("Error response data:", error.response.data);
        }
        res.status(500).json({ success: false, message: 'request failed' });
    }
};
