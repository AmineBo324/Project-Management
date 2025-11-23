import express from "express";
import {addMemberToWorkspace, getUserWorkspaces} from "../controllers/workspaceController.js";
const workspaceRoutes = express.Router();

workspaceRoutes.get("/", getUserWorkspaces);

workspaceRoutes.post("/add-member", addMemberToWorkspace);
export default workspaceRoutes;