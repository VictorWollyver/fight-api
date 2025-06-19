import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { ok } from "assert";

const CreateRoomSchema = z.object({
	name: z.string({ message: "O nome da sala é obrigatório" }).min(1, { message: "Precisa ter pelo menos 1 caracter" }).max(20, { message: "Precisa ter pelo menos de 20 caracteres" }),
	password: z.string().optional().nullable(),
	privacyRoom: z.enum(["PUBLIC", "PRIVATE"], {
		message: "A propriedade 'privacyRoom' precisa ser 'PUBLIC' ou 'PRIVATE'",
	}),
});

type CreateRouteType = z.infer<typeof CreateRoomSchema>;

export async function rooms(app: FastifyInstance) {
	app.get("/", async (req, res) => {
		try {
			const response = await prisma.rooms.findMany({
				where: {
					currentPlayersCount: {
						lt: 2,
					},
				},
			});

			res.send({ message: "Sucesso ao buscar salas!", data: response });
		} catch (error: any) {
			res.status(500).send({
				message: "Erro inesperado ao buscar salas!",
				error: error.message,
			});
			console.error(error);
		}
	});

	app.post("/create", async (req, res) => {
		const { name, password, privacyRoom } = req.body as CreateRouteType;

		try {
			CreateRoomSchema.parse(req.body);

			if (privacyRoom === "PRIVATE" && !password) {
				throw new Error("É necessário informar a senha!");
			}

			const response = await prisma.rooms.create({
				data: {
					name: name,
					password: privacyRoom === "PRIVATE" ? password : "",
					privacyRoom: privacyRoom,
				},
			});

			res.send({
				message: "Sala criada com sucesso!",
				data: response,
			});
		} catch (error: unknown) {
			if (error instanceof z.ZodError) {
				res.status(400).send({ message: error.errors[0].message });
			}

			if (error instanceof Error) {
				res.status(400).send({
					message: error.message,
				});
			}

			res.status(500).send({ message: "Erro inesperado ao criar sala!", error: error });

			console.error(error);
		}
	});

	app.get("/getRoomById/:id", async (req, res) => {
		const { id } = req.params as { id: string };

		try {
			const response = await prisma.rooms.findUnique({ where: { id: id } });

			res.send({
				message: "Sala encontrada!",
				data: response,
			});
		} catch (error: unknown) {
			res.status(500).send({ message: "Erro inesperado ao criar sala!", error: error });
		}
	});

	app.post("/joinRoomById/:id", async (req, res) => {
		const { id } = req.params as { id: string };
		console.log(id);

		try {
			const response = await prisma.rooms.findUnique({ where: { id: id } });

			if (!response) {
				throw new Error("Sala não encontrada!");
			}

			if (response.currentPlayersCount === response.maxPlayersCount) {
				throw new Error("Sala cheia!");
			}

			if (response.privacyRoom === "PUBLIC") {
				await prisma.rooms.update({
					where: { id: id },
					data: {
						currentPlayersCount: response.currentPlayersCount + 1,
					},
				});
			}

			if (response.privacyRoom === "PRIVATE") {
				throw new Error("Sala privada!");
			}

			res.send({
				message: "Juntou a sala com sucesso!",
				data: response,
			});
		} catch (error: unknown) {
			console.error(error);
			res.status(500).send({ message: "Erro inesperado ao criar sala!", error: error });
		}
	});

	app.post("/leaveRoomById/:id", async (req, res) => {
		const { id } = req.params as { id: string };

		try {
			const response = await prisma.rooms.findUnique({ where: { id: id } });

			if (!response) {
				throw new Error("Sala não encontrada!");
			}

			await prisma.rooms.update({
				where: { id: id },
				data: {
					currentPlayersCount: response.currentPlayersCount - 1,
				},
			});

			res.send({
				message: "Saiu da sala com sucesso!",
			});
		} catch (error: unknown) {
			console.error(error);
			res.status(500).send({ message: "Erro inesperado ao criar sala!", error: error });
		}
	});
}
