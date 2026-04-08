import {AuthRequest} from "../middlewares/auth.middleware";
import {Response} from "express";
import {Reclamation} from "../models/reclamation.model";
import {ReclamationStatus, Role} from "../models/enum.type";
import {UserModel} from "../models/user.model";


export const createReclamation = async (req: AuthRequest, res: Response) => {
    try {
        const { content ,subject} = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated"
            });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Content is required"
            });
        }

        const reclamation = await Reclamation.create({
            content: content.trim(),
            clientId: userId,
            subject:subject
        });

        return res.status(201).json(
           reclamation
        );

    } catch (error) {
        console.error("Create Reclamation Error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const updateReclamation = async (req: AuthRequest, res: Response) => {
    try {
        const { content, solution,status } = req.body;
        const { id: reclamationId } = req.params;
        const user = req.user;

        // 🔹 Check auth
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // 🔹 Validate ID
        const id = Number(reclamationId);
        if (!reclamationId || isNaN(id)) {
            return res.status(400).json({
                message: "Invalid reclamation ID",
            });
        }

        // 🔹 Find reclamation once
        const reclamation = await Reclamation.findByPk(id);

        if (!reclamation) {
            return res.status(404).json({
                message: "Reclamation not found",
            });
        }

        // ================= ADMIN =================
        if (user.role === Role.ADMIN) {



            if (status) {
                if (!Object.values(ReclamationStatus).includes(status)) {
                    return res.status(400).json({
                        message: "Invalid status value",
                        allowedValues: Object.values(ReclamationStatus),
                    });
                }
            }else{
                return res.status(400).json({
                    message: "Invalid status value",
                    allowedValues: Object.values(ReclamationStatus),
                })
            }

            await reclamation.update({
                solution: solution.trim(),
                adminId: user.id,
                status: status,
            });

            return res.status(200).json(
              reclamation
            );
        }

        // ================= CLIENT =================
        // 🔹 Check ownership





        if (reclamation.clientId != user.id) {
            console.log("id clinet ",reclamation.clientId )
            console.log("id clinet ",user.id)
            return res.status(403).json({
                message: "Forbidden: You can't update this reclamation",
            });
        }

        // 🔹 Validate content
        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                message: "Content is required",
            });
        }

        await reclamation.update({
            content: content.trim(),
        });

        return res.status(200).json(
           reclamation
        );

    } catch (error) {
        console.error("Update Reclamation Error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const getAllReclamations = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated"
            })
        }
        const whereCondition = user.role === Role.ADMIN ? {} : { clientId: user.id};


        const reclamations = await Reclamation.findAll({
            where: whereCondition,
            include: [
                {
                    model: UserModel,
                    as: "client",
                    attributes: ["id", "firstName", "lastName", "email", "role"],
                },
                {
                    model: UserModel,
                    as: "admin",
                    attributes: ["id", "firstName", "lastName", "email", "role"],
                },
            ],
        });



        return res.status(200).json(
           reclamations
        )



    }catch (error) {
        console.error("Getting Reclamations Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}
export const getReclamationById = async (req: AuthRequest, res: Response) => {
  try {


      const { id } = req.params;
      const user = req.user;
      if (!user) {
          return res.status(401).json({
              message: "Unauthorized: User not authenticated"
          })
      }
      const whereCondition = user.role === Role.ADMIN ? {id:id} : { clientId: user.id ,id:id};


      const reclamation = await Reclamation.findOne({
          where: whereCondition,
          include: [
              {
                  model: UserModel,
                  as: "client",
                  attributes: ["id", "firstName", "lastName", "email", "role"],
              },
              {
                  model: UserModel,
                  as: "admin",
                  attributes: ["id", "firstName", "lastName", "email", "role"],
              },
          ],
      })
      if (!reclamation) {
          return res.status(401).json({
              message: "Reclamation not found"
          })
      }
      return res.status(201).json(
          reclamation
      )

  }catch (error) {
      console.error("Getting Reclamation Error:", error);
      return res.status(401).json({
          message: "internal server error"
      })
  }


}
export const deleteReclamation = async (req: AuthRequest, res: Response) => {

    try {

        const ReclamationId = req.params.id;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated"
            })
        }


        const reclamation = await Reclamation.findOne({
            where:{
                id: ReclamationId,
                clientId: userId,
            }
        })
        if (!reclamation) {
            return res.status(401).json({
                message: "Reclamation not found"
            })
        }

        if (userRole === Role.CLIENT) {
            if (reclamation.status!==ReclamationStatus.IN_PROGRESS){
                return res.status(401).json({
                    message: "impossible delete this reclamation is not in progress",
                })
            }
        }
        await reclamation.destroy()
        return res.status(201).json({
            message: "Reclamation deleted successfully",
        })
    }catch (error) {
        console.error("Delete Reclamation Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }

}


