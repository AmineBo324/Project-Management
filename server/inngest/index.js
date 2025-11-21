import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });



const syncUserCreation = inngest.createFunction(
  { name: "Sync User Creation", event: "clerk/user.created" },
  async ({ event }) => {
    // Log the event data to the console
    const {userData} = event
    await prisma.user.create({
        data: {
            id: userData.id,
            email: userData.email_addresses[0]?.email_address || '',
            name : userData.first_name + ' ' + userData.last_name,
            image : userData.image_url || ''
        }
    })
  }
);

const syncUserDeletion = inngest.createFunction(
  { name: "Sync User Deletion", event: "clerk/user.deleted" },
  async ({ event }) => {
    // Log the event data to the console
    const {userData} = event
    await prisma.user.delete({
        where: {
            id: userData.id
        }
    })
  }
);


const syncUserUpdation = inngest.createFunction(
  { name: "Sync User Update", event: "clerk/user.updated" },
  async ({ event }) => {
    // Log the event data to the console
    const {userData} = event
    await prisma.user.update({
        where: {
            id: userData.id
        },
        data: {
            id: userData.id,
            email: userData.email_addresses[0]?.email_address || '',
            name : userData.first_name + ' ' + userData.last_name,
            image : userData.image_url || ''
        }
    })
  }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];