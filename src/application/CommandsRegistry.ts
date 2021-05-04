import * as Commands from "../commands";
import { BaseCommand } from "../commands";

export class CommandsRegistry {

    private static allCommands: {[key: string]: BaseCommand} = {}
    
    private static init(): void {
        for (const key in Commands) {
            const i = new Commands[key];
            if(key !== "BaseCommand" && i instanceof BaseCommand) 
                this.allCommands[key] = i;
        }
    }

    /**
     * Return all the commands of the CLI.
     */
    public static get all(): {[key: string]: BaseCommand} {
        if(!Object.entries(this.allCommands).length)
            this.init();
        return this.allCommands;
    }

    /**
     * Return instances of all commands in an array.
     */
    public static get allValues() {
        return Object.values(this.all);
    }
}