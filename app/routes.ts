import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("lessons/:id", "routes/lessons.$id.tsx"),
  route("studio", "routes/studio.tsx"),
  route("editor/:id", "routes/editor.$id.tsx"),
] satisfies RouteConfig;
