import * as Commands from "../commands";
import { BaseCommand } from "../commands";

export class CommandsRegistry {

    private static allCommands: {[key: string]: BaseCommand} = {}
    
    /**
     * Inits the registry, must be called at least once.
     */
    public static init(): void {
        for (const key in Commands) {
            const i = new Commands[key];
            if(key !== "BaseCommand" && i instanceof BaseCommand) 
                this.all[key] = i;
        }
    }

    /**
     * Returns all the commands of the CLI, is empty by default.
     */
    public static get all(): {[key: string]: BaseCommand} {
        return this.allCommands;
    }
}