import { fastify } from "fastify";
import fastifyIO from "fastify-socket.io";

import { rooms } from "./routes";

const app = fastify();

app.register(fastifyIO, {
	cors: {
		origin: "*",
	},
});

app.register(rooms, { prefix: "/rooms" });

app.ready().then(() => {
	console.log("app ready");
	app.io.on("connection", (socket) => {
		let count = 0;
		console.log("socket connected", socket.id);

		socket.on("join-room", (roomId) => {
			socket.join(roomId);
			console.log("joined room", roomId);
		});

		socket.on("click", (countClient) => {
			count++;
			console.log("O scoket: ", socket.id, " clicou ", countClient, " vezes");
			console.log("O total de cliques é: ", count);
			console.log("O total de cliques client é: ", countClient);
		});

		socket.on("disconnect", () => {
			console.log("socket disconnected", socket.id);
		});
	});
});

const PORT = Number(process.env.PORT);

app.listen({ port: PORT }).then(() => {
	console.log(`Server running on port ${PORT}`);
});
