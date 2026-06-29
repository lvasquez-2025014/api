import type { Application as AppModel } from "./models";

declare global {
  namespace Express {
    interface Request {
      authApp?: AppModel;
    }
  }
}
