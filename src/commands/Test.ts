import { BaseCommand } from "./template/BaseCommand";

export class Test extends BaseCommand {
    constructor() {
        super();
        this.command = "test";
    }
}
