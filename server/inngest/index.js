import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import  sendEmail  from "../configs/nodemailer.js";
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

//Send Email
const SendTaskAssignmentEmail = inngest.createFunction(
  { id: "send-task-assignment-email", name: "Send Task Assignment Email" },
  { event: "app/task.assigned" },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;
    // Logic
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true },
    });

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assigned: ${task.project.name}`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2> Hi ${task.assignee.name}</h2>
        <p>You have been assigned a new task in the project <strong>${task.project.name}</strong>.</p>
        <p><strong>Task Title:</strong> ${task.title}</p>
        <div style="margin-top: 20px;">
        <p style="white-space: pre-wrap;">Description: ${task.description}</p>
        <p><strong>Due Date:</strong> ${task.due_date.toDateString()}</p>
        </div>
        <a href="${origin}/tasks/${task.id}" style="display: inline-block; padding: 10px 15px; margin-top: 20px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px;">View Task</a>
        <p style="margin-top: 20px;"> Best Regards,<br/> ProTrackr Team </p>
      </div>`,
    })

    if(new Date(task.due_date).toLocaleDateString() !== new Date().toLocaleDateString()) {
      await step.sleepUntil('wait-until-due-date', new Date(task.due_date));
      await step.run('check-if-task-completed', async () => {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });
        if(!task) return;
        if(task.status !== 'DONE') {
          await step.run('send-task-remider-email', async () => {
            await sendEmail({
              to: task.assignee.email,
              subject: `Reminder: Task "${task.title}" is Due Today`,
              html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2> Hi ${task.assignee.name}</h2>
                <p>This is a friendly reminder that the task <strong>"${task.title}"</strong> in the project <strong>${task.project.name}</strong> is due today.</p>
                <p>Please make sure to complete it on time.</p>
                <a href="${origin}/tasks/${task.id}" style="display: inline-block; padding: 10px 15px; margin-top: 20px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 5px;">View Task</a>
                <p style="margin-top: 20px;"> Best Regards,<br/> ProTrackr Team </p>
              </div>`,
            });
          });
        }
      });
  }
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
  SendTaskAssignmentEmail,
];
