import { deleteBasicRoute, save } from "@triptyk/nfw-core";
import { Logger as Log } from "../utils";
import { BaseCommand } from "./template";

export class generateRouteCommand extends BaseCommand {
    public command: string | string[] = "delete-route <prefix>";
    public aliases = ["delroute"];
    public describe = "Deletes a basic route.";

    public async handler(argv: any) {
        await deleteBasicRoute(argv.prefix);
        await save();
        Log.success(`Route /${argv.prefix} deleted !`);
    }
}