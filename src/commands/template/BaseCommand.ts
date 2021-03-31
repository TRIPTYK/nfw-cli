import Yargs, { CommandModule, CommandBuilder } from "yargs";

export abstract class BaseCommand implements CommandModule {

    public abstract command: string | string[];
    public aliases: string[] | string = [];
    public describe: string | false = "";
    public deprecated: boolean | string = false;
    
    public builder: CommandBuilder = {};
    public abstract handler(argv: any): Promise<void>;

}
