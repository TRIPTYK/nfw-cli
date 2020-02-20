/**
 * @module removeRelationAction
 * @author Verliefden Romain
 * @description removes relation between 2 models
 */

// project modules
import utils = require('./lib/utils');
import project = require('../utils/project');
import removeFromModel = require('./lib/removeFromModel');

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


export class RemoveRelationAction {

    model1: string;
    model2: string;
    type: any;

    constructor(model1: string, model2: string, type: any){

        this.model1 = model1;
        this.model2 = model2;
        this.type = type;
    }

    //Main function
     async main () {
         
        if(!utils.modelFileExists(this.model1) ||!utils.modelFileExists(this.model2)) {
            throw new Error('Both model should exist in order to remove a relation between them');
        }
    
        const relationsMap = {
            otm : ['OneToMany','ManyToOne'],
            oto : ['OneToOne','OneToOne'],
            mto : ['ManyToOne','OneToMany'],
            mtm : ['ManyToMany','ManyToMany'],
        };
    
        const model1File = project.getSourceFile(`src/api/models/${this.model1}.model.ts`);
        const model2File = project.getSourceFile(`src/api/models/${this.model2}.model.ts`);
    
        if (!model1File || !model2File) throw new Error("One of the model does not exists");
    
        const model1Class = model1File.getClasses()[0];
        const model2Class = model2File.getClasses()[0];
    
        const p1 = _getModelFromRelationProperty(model1Class,model2Class,relationsMap[this.type][0]);
        const p2 = _getModelFromRelationProperty(model2Class,model1Class,relationsMap[this.type][1]);
    
        if (!p1 || !p2) throw new Error("Relation properties not found");
    
        removeFromModel.removeFromRelationTable(this.model1,p1.getName());
        removeFromModel.removeFromRelationTable(this.model2,p2.getName());
    
        removeFromModel.removeFromSerializer(this.model1,p1.getName(), this.model2,true);
        removeFromModel.removeFromSerializer(this.model2,p2.getName(), this.model1,true);
    
        p1.remove();
        p2.remove();
    
        await project.save();
    };

}


