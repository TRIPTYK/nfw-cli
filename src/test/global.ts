import { promisifiedExec as exec } from "../utils";

export const projectName = "test_project";

export async function createSimpleProject(name = projectName) {
	await exec(`nfw new -dysf --yarn ${name} && cd ${name}`);
}

export async function cleanDocker(container = "nfw") {
	try {
		await exec(`docker stop ${container} && docker rm ${container}`);
	} catch (error) {
		console.log("No container to stop.");
	}
}

export async function cleanProject() {
	try {
		await exec(`rm -rf ${projectName}`);
		await exec("docker stop nfw && docker rm nfw");
	} catch (error) {}
}
