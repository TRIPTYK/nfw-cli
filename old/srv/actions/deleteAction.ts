/**
 * @module delete
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description Delete entity files
 */
import project = require('../utils/project');
import { items } from '../static/resources';
import kebab from '@queso/kebab-case'

export default async (modelName: string) => {
    let deleted = [];

    for (const item of items) {
        const file = project.getSourceFile(`${item.path}/${kebab(modelName)}.${item.template}.ts`);
        if (file) {
            deleted.push({fileName: `${item.path}/${kebab(modelName)}.${item.template}.ts`, type: 'delete'});
            file.delete();
        }
    }   

    await project.save();
    return deleted;
}