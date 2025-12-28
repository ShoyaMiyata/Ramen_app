import { clerkClient } from "@clerk/clerk-sdk-node";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not set");
}

async function restoreShoya() {
  try {
    console.log("🔍 Fetching Shoya Miyata from Clerk...");

    const usersResponse = await clerkClient.users.getUserList({
      emailAddress: ["miyasho20@icloud.com"],
      limit: 1
    });

    const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.data || [];

    if (users.length === 0) {
      console.log("❌ Shoya Miyata not found in Clerk");
      return;
    }

    const user = users[0];

    console.log("Found user:", {
      clerkId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl
    });

    const userData = {
      clerkId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.emailAddresses[0]?.emailAddress || "",
      imageUrl: user.imageUrl,
    };

    console.log("\n🔄 Restoring to Convex...");

    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "users:upsert",
        args: userData,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Restored Shoya Miyata!");
      console.log("Result:", result);
    } else {
      const error = await response.text();
      console.log(`❌ Failed to restore: ${error}`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

restoreShoya();
