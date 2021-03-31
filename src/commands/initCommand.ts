import { BaseCommand } from "./template";

export class Init extends BaseCommand {
    constructor() {
        super();
        this.command = "init";
        this.aliases = [];
        
    }

    handler = async (argv: any) => {
        console.log("inti");
    } 
}