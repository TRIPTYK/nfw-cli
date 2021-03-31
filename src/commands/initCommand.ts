import { BaseCommand } from "./template";

export class Init extends BaseCommand {

    public command = "init";
    public aliases = ["ini"];

    handler = async (argv: any) => {
        console.log("init command");
    } 
}