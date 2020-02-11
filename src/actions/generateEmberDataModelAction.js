const { getSqlConnectionFromNFW } = require('../database/sqlAdaptator');
const project = require('../utils/project');
const fs = require('fs');
const copy = require('clipboardy');
const ejs = require('ejs');

module.exports = async (model) => { 
    const file = project.getSourceFileOrThrow(`./src/api/models/${model}.model.ts`);
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

            const [argument] = decorator.getArguments();
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
}; 