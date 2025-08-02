import express from "express";
import { auth } from "../middlewares/auth.js";
import { generateArticle, generateBlogTitle, generateImage } from "../controller/aiController.js";

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-tirle', auth, generateBlogTitle)
aiRouter.post('/generate-image', auth, generateImage)


export default aiRouter;