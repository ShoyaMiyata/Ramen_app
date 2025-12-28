import { clerkClient } from "@clerk/clerk-sdk-node";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not set");
}

async function restoreUsers() {
  try {
    console.log("🔍 Fetching users from Clerk...");

    // Clerkから全ユーザーを取得
    const usersResponse = await clerkClient.users.getUserList({ limit: 500 });

    console.log("Response:", JSON.stringify(usersResponse, null, 2).substring(0, 500));

    const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse as { data?: unknown[] }).data || [];

    console.log(`📦 Found ${users.length} users in Clerk`);

    if (users.length === 0) {
      console.log("❌ No users found in Clerk");
      return;
    }

    // Convex mutation を呼び出すためのデータを生成
    const usersToRestore = users.map((user: any) => ({
      clerkId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Unknown",
      email: user.emailAddresses[0]?.emailAddress || "",
      imageUrl: user.imageUrl,
    }));

    console.log("\n📋 Users to restore:");
    usersToRestore.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Clerk ID: ${user.clerkId}`);
    });

    console.log("\n⚠️  Next steps:");
    console.log("1. Go to Convex Dashboard: https://dashboard.convex.dev");
    console.log("2. Open the 'Functions' tab");
    console.log("3. Run 'auth.store' mutation for each user manually with the following data:");
    console.log("\nOr use the following curl commands:\n");

    // Convex HTTP API経由で復元
    const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!CONVEX_URL) {
      console.log("❌ NEXT_PUBLIC_CONVEX_URL is not set. Cannot restore automatically.");
      console.log("\n📝 Please restore manually using the data above.");
      return;
    }

    console.log("🔄 Restoring users to Convex...\n");

    for (const user of usersToRestore) {
      try {
        const response = await fetch(`${CONVEX_URL}/api/mutation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "auth:store",
            args: user,
          }),
        });

        if (response.ok) {
          console.log(`✅ Restored: ${user.name} (${user.email})`);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to restore ${user.name}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error restoring ${user.name}:`, error);
      }
    }

    console.log("\n✅ User restoration complete!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

restoreUsers();
