import { getSqlConnectionFromNFW } from '../database/sqlAdaptator';
import project = require('../utils/project');
import fs = require('fs');
import copy = require('clipboardy');
import ejs = require('ejs');



export class GenerateEmberDataModelActionClass {

    model: string;

    constructor(model: string){
        this.model = model;
    }

    async main(){

        const file = project.getSourceFileOrThrow(`./src/api/models/${this.model}.model.ts`);
        const [theClass] = file.getClasses();
        const elements = [];
        
        for (let prop of theClass.getInstanceProperties().filter((p) => p.getName() !== 'id'))
        {
            const [decorator] = prop.getDecorators();
            if (decorator) {
                let DSfncName = decorator.getName();

                if (['OneToMany','ManyToMay'].includes(DSfncName)) {
                    DSfncName = 'hasMany';
                }else if (['ManyToOne','OneToOne'].includes(DSfncName)){
                    DSfncName = 'belongsTo';
                }else{
                    DSfncName = 'attr';
                }

                const [argument]: any = decorator.getArguments();
                let argType = null;
                
                if (DSfncName === 'attr' && argument) {
                    if (argument.getProperties) {
                        const foundType = argument.getProperty('type');

                        if (foundType) {
                            const argumentType = foundType.getInitializer().getText();
                            if (['varchar','text','char'].includes(argumentType)) {
                                argType = '"string"';
                            }else if (['Date'].includes(argumentType)) {
                                argType = '"date"';
                            }
                        }else{
                            const argumentType = prop.getType().getText();
                            
                            if (['string'].includes(argumentType)) {
                                argType = '"string"';
                            }else if (['number'].includes(argumentType)) {
                                argType = '"number"';
                            }else if (['date','datetime'].includes(argumentType)) {
                                argType = '"date"';
                            }
                        }
                    }
                }
                
                
                if (DSfncName !== 'attr' && argument) {
                    argType = `"${argument.getBodyText().toLowerCase()}"`;
                }

                elements.push({
                    property : prop.getName(),
                    function : DSfncName,
                    arg : argType
                });
            }
        }

        const ejsTemplateFile = fs.readFileSync(__dirname + '/../templates/emberModel.ejs','utf-8');

        const compiled = ejs.compile(ejsTemplateFile)({
            modelName : theClass.getName(),
            elements
        });

        copy.writeSync(compiled);
        }

}
