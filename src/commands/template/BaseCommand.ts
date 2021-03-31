import { CommandModule } from "yargs";

export abstract class BaseCommand implements CommandModule {

    public abstract command;
    public aliases = [];
    public describe = "";
    public deprecated = false;
    public builder = {};

    public abstract handler: (argv: any) => Promise<void>;

}
