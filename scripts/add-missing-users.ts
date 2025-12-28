import { clerkClient } from "@clerk/clerk-sdk-node";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CLERK_SECRET_KEY || !CONVEX_URL) {
  throw new Error("Required environment variables are not set");
}

async function addMissingUsers() {
  try {
    console.log("🔍 Step 1: Fetching all users from Clerk...");
    const clerkUsersResponse = await clerkClient.users.getUserList({ limit: 500 });
    const clerkUsers = Array.isArray(clerkUsersResponse) ? clerkUsersResponse : (clerkUsersResponse as { data?: unknown[] }).data || [];

    console.log(`   Found ${clerkUsers.length} users in Clerk`);

    console.log("\n🔍 Step 2: Fetching all users from Convex...");
    const convexResponse = await fetch(`${CONVEX_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "users:list",
        args: {},
      }),
    });

    const convexResult = await convexResponse.json();
    const convexUsers = convexResult.status === "success" ? convexResult.value : [];
    const convexEmails = new Set(convexUsers.map((u: any) => u.email));

    console.log(`   Found ${convexUsers.length} users in Convex`);
    console.log(`   Emails in Convex: ${Array.from(convexEmails).join(", ")}`);

    console.log("\n📋 Step 3: Finding missing users...");
    const missingUsers = clerkUsers.filter((clerkUser: any) => {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      return email && !convexEmails.has(email);
    });

    if (missingUsers.length === 0) {
      console.log("   ✅ All Clerk users already exist in Convex!");
      return;
    }

    console.log(`   Found ${missingUsers.length} missing users:`);
    missingUsers.forEach((user: any, index) => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Unknown";
      const email = user.emailAddresses[0]?.emailAddress;
      console.log(`   ${index + 1}. ${name} (${email})`);
    });

    console.log("\n🔄 Step 4: Adding missing users to Convex...");

    for (const user of missingUsers) {
      const clerkUser = user as any;
      const userData = {
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Unknown",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        imageUrl: clerkUser.imageUrl,
      };

      try {
        const response = await fetch(`${CONVEX_URL}/api/mutation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "users:upsert",
            args: userData,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === "success") {
            console.log(`   ✅ Added: ${userData.name} (${userData.email})`);
          } else {
            console.log(`   ❌ Failed: ${userData.name} - ${result.errorMessage}`);
          }
        } else {
          console.log(`   ❌ Failed: ${userData.name} - ${await response.text()}`);
        }
      } catch (error) {
        console.log(`   ❌ Error adding ${userData.name}:`, error);
      }
    }

    console.log("\n✅ Done! All missing users have been added.");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addMissingUsers();
