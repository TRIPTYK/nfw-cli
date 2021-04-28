import { promisifiedExec as exec } from "../utils";

export const projectName = "test_project";

export async function createSimpleProject() {
	await exec(`nfw new -dysf --yarn ${projectName} && cd ${projectName}`);
}

export async function cleanProject() {
	try {
		await exec(`rm -rf ${projectName}`);
		await exec("docker stop nfw && docker rm nfw");
	} catch (error) {}
}
