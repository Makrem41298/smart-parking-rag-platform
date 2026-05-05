import axios from "axios";
import { Response,Request} from "express";
import {AuthRequest} from "../middlewares/auth.middleware";
import dotenv from "dotenv";
import {Reclamation} from "../models/reclamation.model";





export const agentResponse = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Token:", req.headers.authorization);
        dotenv.config();

        const {question,reclamationId,generationResponse,generalResponse} = req.body;

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
        console.log("updatedHistory",updatedHistory)

        const response = await axios.post(

            process.env.AGENT_SERVICE_URL + "/agent",
            {
                question: question,
                userId:reclamation.clientId,
                reclamationId:reclamationId,
                generationResponse:generationResponse,
                generalResponse:generalResponse,
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


        console.log("updatedHistory",updatedHistory)

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



