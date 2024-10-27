import { fastify } from "fastify";

import { rooms } from "./routes";

const app = fastify();

app.register(rooms, { prefix: "/rooms" });

const PORT = Number(process.env.PORT);
app.listen({ port: PORT }).then(() => {
  console.log(`Server running on port ${PORT}`);
});
