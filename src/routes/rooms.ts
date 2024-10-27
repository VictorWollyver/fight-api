import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function rooms(app: FastifyInstance) {
  app.get("/", async (req, res) => {
    try {
      const response = await prisma.rooms.findMany();

      res.send({ response });
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/create", async (req, res) => {
    try {
      const response = await prisma.rooms.create({
        data: {
          name: "Room 1",
          password: "",
          privacyRoom: "PUBLIC",
          gameMode: "CLASSIC",
          maxPlayersCount: 2,
          currentPlayersCount: 0,
        },
      });

      res.send({ response });
    } catch (error) {
      console.log(error);
    }
  });
}
