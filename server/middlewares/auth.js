import { clerkClient } from "@clerk/express";

// Middleware to check userId and hasPremiumplan

export const auth = async (req, res, next) => {
    try {
        // Get userId and the 'has' function from Clerk's request auth
        const { userId, has } = await req.auth();

        // Check if the user has a premium plan
        const hasPremium = await has({ plan: 'premium' });

        // Fetch the user object from Clerk
        const user = await clerkClient.users.getUser(userId);

        // If the user does NOT have premium and has a free_usage value
        if (!hasPremium && user.privateMetadata.free_usage) {
            // Attach the free_usage value to the request object

            req.free_usage = user.privateMetadata.free_usage;
        } else {
            // If the user has premium or no free_usage, reset free_usage to 0 in Clerk
            await clerkClient.users.updateUserMetadata(userId, {
                // Reset free_usage to 0
                privateMetadata: {
                    free_usage: 0
                }
            });
            // Attach 0 to the request object
            req.free_usage = 0;
        }

        // Attach the user's plan to the request object
        req.plan = hasPremium ? 'premium' : 'free';

        // Continue to the next middleware or route handler
        next();
        
    } catch (error) {
        // If there's any error (e.g., not authenticated), return 401 Unauthorized
        res.status(401).json({ success: false, message: error.message });
    }
}