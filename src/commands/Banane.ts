import { BaseCommand } from "./template";

export class Banane extends BaseCommand {
    constructor() {
        super();
        this.command = "banane";
        this.aliases = ["b"];
    }

    handler = async (argv: any) => {
        console.log("AHAAH CHUI UNE BANANE");
    } 
}