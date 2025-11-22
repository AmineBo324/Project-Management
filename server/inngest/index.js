import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ProTrackr" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation", name: "Sync User Creation" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0]?.email_address || "",
        name: data.first_name + " " + data.last_name,
        image: data.image_url || "",
      },
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion", name: "Sync User Deletion" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: { id: data.id },
    });
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updation", name: "Sync User Update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        id: data.id,
        email: data.email_addresses[0]?.email_address || "",
        name: data.first_name + " " + data.last_name,
        image: data.image_url || "",
      },
    });
  }
);


// Sync Workspace Creation
const syncWorkspanceCreation = inngest.createFunction(
  { id: "sync-workspace-creation", name: "Sync Workspace Creation" },
  { event: "clerk/organization.created" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug : data.slug,
        ownerId : data.created_by,
        image_url : data.image_url || "",
      },
    });
    //Add creator as admin member 
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  }
);

//Sync Workspance Updation
const syncWorkspaceUpdation = inngest.createFunction(
  { id: "sync-workspace-updation", name: "Sync Workspace Updation" },
  { event: "clerk/organization.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug : data.slug,
        image_url : data.image_url || "",
      },
    });
  }
);

//Sync Workspace Deletion
const syncWorkspaceDeletion = inngest.createFunction(
  { id: "sync-workspace-deletion", name: "Sync Workspace Deletion" },
  { event: "clerk/organization.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: { id: data.id },
    });
  }
);

//Save worspace member into database
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-creation", name: "Sync Workspace Member Creation" },
  { event: "clerk/organizationInvitation.accepted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });
  }
);

// Export all functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspanceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
];
