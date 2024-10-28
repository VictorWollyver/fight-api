import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z, ZodError } from "zod";

const CreateRoomSchema = z.object({
  name: z
    .string({ message: "O nome da sala é obrigatório" })
    .min(1, { message: "Precisa ter pelo menos 1 caracter" })
    .max(20, { message: "Precisa ter pelo menos de 20 caracteres" }),
  password: z.string().optional(),
  privacyRoom: z.enum(["PUBLIC", "PRIVATE"], {
    message: "A propriedade 'privacyRoom' precisa ser 'PUBLIC' ou 'PRIVATE'",
  }),
  gameMode: z.enum(["CLASSIC"]),
  maxPlayersCount: z.number(),
  currentPlayersCount: z.number(),
});

type CreateRouteType = z.infer<typeof CreateRoomSchema>;

export async function rooms(app: FastifyInstance) {
  app.get("/", async (req, res) => {
    try {
      const response = await prisma.rooms.findMany();

      res.send({ message: "Sucesso ao buscar salas!", data: response });
    } catch (error: any) {
      res.send({
        message: "Erro inesperado ao buscar salas!",
        error: error.message,
      });
      console.error(error);
    }
  });

  app.post("/create", async (req, res) => {
    let { name, password, privacyRoom, gameMode, maxPlayersCount } =
      req.body as CreateRouteType;

    try {
      CreateRoomSchema.parse(req.body);

      const response = await prisma.rooms.create({
        data: {
          name: name,
          password: password,
          privacyRoom: privacyRoom || "PUBLIC",
          gameMode: gameMode || "CLASSIC",
          maxPlayersCount: maxPlayersCount,
          currentPlayersCount: 0,
        },
      });

      res.send({
        message: "Sala criada com sucesso!",
        data: response,
      });
    } catch (error: ZodError | any) {
      if (error instanceof ZodError) {
        res.send({ message: error.message });
      }

      res.send({ message: "Erro inesperado ao criar sala!", error: error });

      console.error(error.message);
    }
  });
}
