import { promisifiedExec } from "../utils";
import { chaiExecSync } from "@jsdevtools/chai-exec";
import { join } from "path";
import { use } from "chai";

/**
 * Name of the test project. Must be common to all tests.
 */
export const projectName = "test_project";

/**
 * Completely arbitrary string to use as an input for your commands.
 * @see https://www.youtube.com/watch?v=S-Eyhq-D9yM
 */
export const testInput = "bananalegacy";

chaiExecSync.defaults = {
	options: {
		cwd: join(process.cwd(), projectName)
	}
};

/**
 * Function to use to execute commands in the test project.
 */
export const execInProject = chaiExecSync;

use(execInProject);

/**
 * Creates a simple nfw project with a container linked to it.
 * @param name Name of the project (takes the projectName value by default).
 */
export async function createSimpleProject(name = projectName) {
	await promisifiedExec(`nfw new -dysf --yarn ${name} && cd ${name}`);
}

/**
 * Clean any given container.
 * @param container Name/sha256 of the container ("nfw" by default).
 */
export async function cleanDocker(container = "nfw") {
	try {
		await promisifiedExec(`docker stop ${container} && docker rm ${container}`);
	} catch (error) {
		console.log("No container to clean.");
	}
}

/**
 * Clean the test project.
 */
export async function cleanProject() {
	try {
		await promisifiedExec(`rm -rf ${projectName}`);
		await cleanDocker();
	} catch (error) {}
}
