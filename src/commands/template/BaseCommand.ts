import { CommandModule } from "yargs";

export abstract class BaseCommand implements CommandModule {

    public abstract command: string | string[];
    public aliases: string[] | string = [];
    public describe: string | false = "";
    public deprecated: boolean | string = false;
    /**
     * Optionnal string to give a note about a command.
     */
    public note?: string;
    
    constructor() {
        if(this.handler)
            this.handler = this.handler.bind(this);
    }
    
    public builder: any = {};
    public abstract handler(argv: any): Promise<void>;

}
