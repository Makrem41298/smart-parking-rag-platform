import axios from "axios";
import { Response,Request} from "express";
import {AuthRequest} from "../middlewares/auth.middleware";


export const agentResponse = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Token:", req.headers.authorization);

        const response = await axios.post(
            "http://127.0.0.1:8000/agent",
            {
                question: req.body.question
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
            message: "Error calling agent service"
        });
    }
};



