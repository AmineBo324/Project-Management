import prisma from '../configs/prisma.js';

// Create a new project
export const createProject = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const { workspaceId,name, description, status, start_date, end_date, team_members, team_lead, progress, priority } = req.body;

        const workspace = await prisma.workspace.findUnique({
            where: {
                id: workspaceId
            }, 
            include: {
                members: {include: {user: true}}
            }
        });
        if (!workspace) {
            return res.status(404).send('Workspace not found');
        }

        if(!workspace.members.some(member => member.userId === userId && member.role !== 'ADMIN')) {
            return res.status(403).send('You don t have permission to create a project in this workspace');
        }

        const teamLead = await prisma.user.findUnique({
            where: {
                email: team_lead
            },
            select : { id: true }
        });

        const project = await prisma.project.create({
            data: {
                workspaceId,
                name,
                description,
                status,
                priority,
                progress,
                teamLeadId: teamLead?.id,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
            }
        });

        if (team_members && team_members.length > 0) {
            const membersToAdd = [];
            workspace.members.forEach(member => {
                if (team_members.includes(member.user.email)) {
                    membersToAdd.push(member.userId);
                }
            });

            await prisma.projectMember.createMany({
                data: membersToAdd.map(memberId => ({
                    projectId: project.id,
                    userId : memberId,
                }))
            });
        } 

        const projectWithMembers = await prisma.project.findUnique({
            where: { id: project.id },
            include: { members: { include: { user: true } },
                        tasks :  { include: { assignee: true, comments : {include : { user: true }} } },
                    owner : true,}
        });

        res.json({project: projectWithMembers, message: 'Project created successfully'});

    } catch (error) {
        
    }
    res.send('Project created');
}

//update a project
export const updateProject = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id, workspaceId, name, description, status, start_date, end_date, progress, priority } = req.body;

         const workspace = await prisma.workspace.findUnique({
            where: {
                id: workspaceId
            }, 
            include: {
                members: {include: {user: true}}
            }
        });
        if (!workspace) {
            return res.status(404).send('Workspace not found');
        }

        if(!workspace.members.some(member => member.userId === userId && member.role !== 'ADMIN')) {
            const project = await prisma.project.findUnique({
                where: { id }
            });
            if(!project) {
                return res.status(404).send('Project not found');
            }else if(project.team_lead !== userId) {
                return res.status(403).send('You don t have permission to update this project');
            }
        }
                
        const project = await prisma.project.update({
            where: { id },
            data: {
                workspaceId,
                name,
                description,
                status,
                priority,
                progress,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
            }   
        });
        res.json({project, message: 'Project updated successfully'});
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

// Add member to project
export const addMemberToProject = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const {projectId} = req.params;
        const { email } = req.body;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {members: {include: {user: true}}}
        })
        if (!project) {
            return res.status(404).send('Project not found');
        }
        if (project.team_lead !== userId) {
            return res.status(403).send('You don t have permission to add members to this project');
        }

        const existingMember = project.members.find(member => member.email === email);
        if (existingMember) {
            return res.status(400).send('User is already a member of this project');
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const member = await prisma.projectMember.create({
            data: {
                projectId,
                userId: user.id
            }
        });

        res.json({member, message: 'Member added to project successfully'});
    
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}