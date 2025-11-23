import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import workspaceRoutes from './routes/workspaceRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';


const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/workspaces", protect, workspaceRoutes);

app.use("/api/projects", protect, projectRoutes);

app.use("/api/tasks", protect, taskRoutes);

app.use("/api/comments", protect, commentRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

