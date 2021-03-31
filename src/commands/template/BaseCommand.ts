import { CommandModule } from "yargs";

export abstract class BaseCommand implements CommandModule {

    public command = "default";
    public aliases = [];
    public describe = "";
    public deprecated = false;
    public builder = {};

    public handler = async (argv: any): Promise<void> => {
        console.log(this.command);
    }
}
