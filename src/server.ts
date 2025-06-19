import { fastify } from "fastify";
import fastifyIO from "fastify-socket.io";
import cors from "@fastify/cors";

import { rooms } from "./routes";
import Player from "./class/player";

const app = fastify();

app.register(cors, {
	origin: "*",
});

app.register(fastifyIO, {
	cors: {
		origin: "*",
	},
});

app.register(rooms, { prefix: "/rooms" });

const players: Player[] = [];

app.ready().then(() => {
	console.log("app ready");
	app.io.on("connection", (socket) => {
		console.log("socket connected", socket.id);
		socket.emit("socketId", socket.id);

		socket.on("join-room", (roomId) => {
			socket.join(roomId);
			const socketsInRoom = app.io.sockets.adapter.rooms.get(roomId);

			// `socketsInRoom` é um objeto Set contendo os IDs dos sockets
			if (socketsInRoom) {
				console.log(`Sockets na sala ${roomId}:`, [...socketsInRoom]);
			}
		});

		socket.on("click", (roomId) => {
			console.log(socket.rooms);
			console.log(roomId);
			const player = players.find((player) => player.getSocketId() === socket.id);
			player?.increment();
			app.io.emit("click", player?.getCount());
		});

		socket.on("ROUND_END", () => {
			const player = players.find((player) => player.getSocketId() === socket.id);
			player?.increment();
			app.io.emit("ROUND_WON", player?.getCount());
		});

		socket.on("disconnect", () => {
			console.log("socket disconnected", socket.id);
			const playerIndex = players.findIndex((player) => player.getSocketId() === socket.id);
			players.splice(playerIndex, 1);
		});
	});
});

const PORT = Number(process.env.PORT);

app.listen({ port: PORT }).then(() => {
	console.log(`Server running on port ${PORT}`);
});
