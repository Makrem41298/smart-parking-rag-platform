import axios from "axios";
import { Response,Request} from "express";
import {AuthRequest} from "../middlewares/auth.middleware";
import dotenv from "dotenv";





export const agentResponse = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Token:", req.headers.authorization);
        dotenv.config();
        console.log(req.body);
        const response = await axios.post(


            process.env.AGENT_SERVICE_URL + "/agent",
            {
                question: req.body.question,
                userId:req.body.userId,
                generationResponse:req.body.generationResponse,
                generalResponse:req.body.generalResponse,
            },
            {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        );

        return res.status(200).json(response.data);

    } catch (error: any) {
        console.error(error?.response?.data || error.message);

        return res.status(500).json({
            message: "Error calling agent service: " + (error?.response?.data.detail || error.message.detail)
        });
    }
};



