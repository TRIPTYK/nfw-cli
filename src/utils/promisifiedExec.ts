import { exec } from "child_process";

/**
 * Execute a given command.
 * @param command Command to execute.
 */
export async function promisifiedExec (command: string) {
    return new Promise<string>((res, rej) => {
        exec(command, (err, stdout, stderr) => {
            if(err) rej({...err, stderr, stdout});
            res(stdout);
        });
    });
}