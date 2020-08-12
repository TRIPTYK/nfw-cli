import project = require('../utils/project');
import fs = require('fs');
import copy = require('clipboardy');
import ejs = require('ejs');
import kebabCase from '@queso/kebab-case';
import * as pascalcase from 'pascalcase';
import { SyntaxKind } from 'ts-morph';
import * as stringifyObject from 'stringify-object';
import * as camelCase from 'camelcase';
import * as Faker from "faker";

export default async function generateMirageModelAction(model: string,rows: number) {
    const file = project.getSourceFileOrThrow(`./src/api/models/${kebabCase(model)}.model.ts`);
    const className = pascalcase(model);
    const theClass = file.getClass(className);
    const elements = [];
    const data = [];
    
    for (let prop of theClass.getInstanceProperties().filter((p) => p.getName() !== 'id' && p.getDecorator("Column")))
    {
       let type;
       let length = null;
       const decorator = prop.getDecorator("Column");
       const args = decorator.getArguments();

        if (args.length === 1) { // @Column({...})
            for (const objectProp of args[0].getChildrenOfKind(SyntaxKind.PropertyAssignment)) {
                const propertyName = objectProp.getFirstChildByKindOrThrow(SyntaxKind.Identifier).getText();
                if (propertyName === "type") {
                    type = objectProp.getInitializer().getText();
                }
                if (propertyName === "length") {
                    length = objectProp.getInitializer().getText();
                }
            } 
        }else if (args.length === 2){ // @Column("blah",{...})
            type = args[0].getText();
        }

        if (!type) {
            type = prop.getType().getText();
        }

        elements.push({name: prop.getName(),type,length});
    }

    console.log(elements);

    for (let index = 1; index <= rows; index++) {
        const object = {id:index};
        for (const {name,type,length} of elements) {
            let value = null;

            // arma 3 like syntax
            switch(true) {
                case ["string","varchar"].includes(type): 
                    value = Faker.lorem.text().substr(0,length ?? 255);
                    break;
                case ["Date","timestamp","datetime","date"].includes(type): 
                    value = Faker.date.recent();
                    break;
                case ["text"].includes(type): 
                    value = Faker.lorem.text();
                    break;  
                case ['"simple-enum"','"enum"'].includes(type): 
                    value = Faker.lorem.word();
                    break;
                case ["number","integer","float","decimal"].includes(type): 
                    value = Faker.random.number(255);
                    break;  
                case ["boolean"].includes(type): 
                    value = Faker.random.boolean();
                    break;  
            }

            object[camelCase(name)] = value;
        }
        data.push(object);
    }

    const ejsTemplateFile = fs.readFileSync(__dirname + '/../templates/mirageData.ejs','utf-8');

    const compiled = ejs.compile(ejsTemplateFile)({
        modelName : theClass.getName(),
        data : stringifyObject(data)
    });

    copy.writeSync(compiled);
}