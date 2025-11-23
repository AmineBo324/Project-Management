import prisma from "../configs/prisma.js";

// GET all workspaces of a user
export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId: userId },
        },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });

    return res.status(200).json({ workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
};

// ADD member to a workspace
export const addMemberToWorkspace = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, role, workspaceId, message } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace)
      return res.status(404).json({ error: "Workspace not found" });

    if (!workspace.members.find(m => m.userId === userId && m.role === "ADMIN")) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    if (workspace.members.find(m => m.userId === user.id)) {
      return res.status(400).json({ error: "User already a member" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    return res.status(200).json({
      member,
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Failed to add member:", error);
    return res.status(500).json({ error: "Failed to add member" });
  }
};
