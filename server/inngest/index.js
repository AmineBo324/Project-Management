import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ProTrackr" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation", name: "Sync User Creation" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { userData } = event;

    await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email_addresses[0]?.email_address || "",
        name: userData.first_name + " " + userData.last_name,
        image: userData.image_url || "",
      },
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion", name: "Sync User Deletion" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { userData } = event;

    await prisma.user.delete({
      where: { id: userData.id },
    });
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updation", name: "Sync User Update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { userData } = event;

    await prisma.user.update({
      where: { id: userData.id },
      data: {
        id: userData.id,
        email: userData.email_addresses[0]?.email_address || "",
        name: userData.first_name + " " + userData.last_name,
        image: userData.image_url || "",
      },
    });
  }
);

// Export all functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];
