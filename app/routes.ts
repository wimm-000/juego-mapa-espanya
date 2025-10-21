import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("juego", "routes/juego.tsx"),
  route("dev", "routes/dev.tsx"),
  route("estudiar", "routes/estudiar.tsx"),
] satisfies RouteConfig;
