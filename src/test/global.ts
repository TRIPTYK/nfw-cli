import { promisifiedExec as exec } from "../utils";

/**
 * Name of the test project. Must be common to all tests.
 */
export const projectName = "test_project";

/**
 * Creates a simple nfw project with a container linked to it.
 * @param name Name of the project (takes the projectName value by default).
 */
export async function createSimpleProject(name = projectName) {
	await exec(`nfw new -dysf --yarn ${name} && cd ${name}`);
}

/**
 * Clean any given container.
 * @param container Name/sha256 of the container ("nfw" by default).
 */
export async function cleanDocker(container = "nfw") {
	try {
		await exec(`docker stop ${container} && docker rm ${container}`);
	} catch (error) {
		console.log("No container to stop.");
	}
}

/**
 * Clean the test project.
 */
export async function cleanProject() {
	try {
		await exec(`rm -rf ${projectName}`);
		await cleanDocker();
	} catch (error) {}
}

export async function goToProject() {
	await exec(`cd ${projectName}`);
}
