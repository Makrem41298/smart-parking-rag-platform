import axios from "axios";
import { Response,Request} from "express";
import {AuthRequest} from "../middlewares/auth.middleware";
import dotenv from "dotenv";
import {Reclamation} from "../models/reclamation.model";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";



export const agentResponse = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Token:", req.headers.authorization);
        dotenv.config();
        console.log(req.body)
        const {question,reclamationId,modeResponse} = req.body;





        const reclamation = await Reclamation.findByPk(reclamationId);



        if (!reclamation) {
            return res.status(404).json({
                message: "Reclamation not found"
            });
        }
        let updatedHistory = [
            ...(reclamation.conversationHistory || []),
            {
                sender: "HumanMessage",
                message: question,
                date: new Date(),
            },
        ];

        const response = await axios.post(

            process.env.AGENT_SERVICE_URL + "/agent",
            {
                question: question,
                userId:Number(reclamation.clientId),
                reclamationId:Number(reclamationId),
                mode_response:modeResponse,
            },
            {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        );
         updatedHistory = [
            ...(updatedHistory|| []),
            {
                sender: "IAMessage:",
                message: response.data.answer,
                date: new Date(),
            },
        ];



        await reclamation.update({
            conversationHistory: updatedHistory,
        });




        return res.status(200).json(response.data);


    } catch (error: any) {
        console.error(error?.response?.data || error.message);

        return res.status(500).json({
            message: "Error calling agent service: " + (error?.response?.data.detail || error.message.detail)
        });
    }
};
export const uploadFiles = async (req: AuthRequest, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "No files uploaded",
            });
        }

        const formData = new FormData();

        files.forEach((file) => {
            formData.append("files", fs.createReadStream(file.path), {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        });

        const response = await axios.post(
            "http://localhost:8000/save-files",
            formData,

            {

                headers: {
                    ...formData.getHeaders(),
                    Authorization: req.headers.authorization,
                }

            }
        );

        files.forEach((file) => fs.unlinkSync(file.path));

        return res.json(response.data);
    } catch (error: any) {
        return res.status(500).json({
            message: "Upload failed",
            error: error.message,
        });
    }
};
export const getFiles = async (req: Request, res: Response) => {
    try {
        const response = await axios.get("http://localhost:8000/files", {
            headers: {
                Authorization: req.headers.authorization,
            },
        });

        return res.json(response.data);
    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to fetch files",
            error: error.message,
        });
    }
};


const FASTAPI_URL = "http://localhost:8000";

export const deleteFiles = async (req: Request, res: Response) => {
    try {
        const { filenames } = req.body;

        const response = await axios.post(
            `${FASTAPI_URL}/files/delete-batch`,
            { filenames },
            {
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );

        return res.json(response.data);
    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to delete files",
            error: error.message,
        });
    }
};

export const downloadFile = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        const response = await axios.get(
            // @ts-ignore
            `${FASTAPI_URL}/files/${encodeURIComponent(filename)}/download`,
            {
                responseType: "stream",
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        response.data.pipe(res);
    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to download file",
            error: error.message,
        });
    }
};


export const getVectorstoreStatus = async (
    req: Request,
    res: Response
) => {
    try {
        const response = await axios.get(
            "http://localhost:8000/vectorstore/status",
            {
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );

        return res.json(response.data);

    } catch (error: any) {

        return res.status(500).json({
            message: "Failed to fetch vectorstore status",
            error: error.message,
        });
    }
};