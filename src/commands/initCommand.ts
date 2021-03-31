import { BaseCommand } from "./template";

export class InitCommand extends BaseCommand {

    public command = "init";
    public aliases = ["ini"];


    async handler (argv: any) {
        console.log("init command");
    } 
}