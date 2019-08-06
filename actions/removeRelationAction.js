/**
 * @module removeRelationAction
 * @author Verliefden Romain
 * @description removes relation between 2 models
 */

// project modules
const utils = require('./lib/utils');
const project = require('../utils/project');
const removeFromModel = require('./lib/removeFromModel');

const _getModelFromRelationProperty = (model1Class,model2Class,relation) => {
    for (const p of model1Class.getProperties()) {
        for (const decorator of p.getDecorators()) {
            if (decorator.getName() === relation) {
                const type = decorator.getArguments()[0].getReturnType().getSymbol().getEscapedName();

                if (type === model2Class.getName()) {
                    return p;
                }
            }
        }
    }
};

/**
 * Main function
 * @param {string} model1
 * @param {string} model2
 * @returns {Promise<void>}
 */
module.exports = async (model1, model2, type) => {
    if(!utils.modelFileExists(model1) ||!utils.modelFileExists(model2)) {
        throw new Error('Both model should exist in order to remove a relation between them');
    }

    const relationsMap = {
        otm : ['OneToMany','ManyToOne'],
        oto : ['OneToOne','OneToOne'],
        mto : ['ManyToOne','OneToMany'],
        mtm : ['ManyToMany','ManyToMany'],
    };

    const model1File = project.getSourceFile(`src/api/models/${model1}.model.ts`);
    const model2File = project.getSourceFile(`src/api/models/${model2}.model.ts`);

    if (!model1File || !model2File) throw new Error("One of the model does not exists");

    const model1Class = model1File.getClasses()[0];
    const model2Class = model2File.getClasses()[0];

    const p1 = _getModelFromRelationProperty(model1Class,model2Class,relationsMap[type][0]);
    const p2 = _getModelFromRelationProperty(model2Class,model1Class,relationsMap[type][1]);

    if (!p1 || !p2) throw new Error("Relation properties not found");

    removeFromModel.removeFromRelationTable(model1,p1.getName());
    removeFromModel.removeFromRelationTable(model2,p2.getName());

    removeFromModel.removeFromSerializer(model1,p1.getName(),model2,true);
    removeFromModel.removeFromSerializer(model2,p2.getName(),model1,true);

    p1.remove();
    p2.remove();

    await project.save();
};