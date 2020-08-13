import project = require('../utils/project');
import fs = require('fs');
import copy = require('clipboardy');
import ejs = require('ejs');
import kebabCase from '@queso/kebab-case';
import * as pascalcase from 'pascalcase';
import { SyntaxKind, ArrowFunction, PropertyAccessExpression, SourceFile } from 'ts-morph';
import * as stringifyObject from 'stringify-object';
import * as camelCase from 'camelcase';
import * as Faker from "faker";
import mkdirp = require('mkdirp');
import { writeFileSync } from 'fs';
import { plural } from 'pluralize';

export async function generateModelData(file: SourceFile,model: string,rows: number) {
    const className = pascalcase(model);
    const [theClass] = file.getClasses();
    const elements = [];
    const data = [];
    const relations = [];
    
    for (let prop of theClass.getInstanceProperties().filter((p) => p.getName() !== 'id'))
    {
       let type;
       let length = null;
       const columnDecorator = prop.getDecorator("Column");
       if (columnDecorator) {
        const args = columnDecorator.getArguments();

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
        }else if (args.length === 2) { // @Column("blah",{...})
            type = args[0].getText();
        }

        if (!type) {
            type = prop.getType().getText();
        }

        elements.push({name: prop.getName(),type,length});
       }

       let relationDecorator = prop.getDecorator("ManyToMany") ?? prop.getDecorator("OneToMany") ?? prop.getDecorator("OneToOne");

       if (relationDecorator && relationDecorator.getName() === "OneToOne" && !prop.getDecorator("JoinColumn")) {
        relationDecorator = null;
       }

       if (relationDecorator) {
            const [typeArg,propertyArg] = relationDecorator.getArguments() as [ArrowFunction,ArrowFunction];
            const type = typeArg.getBodyText();
            const body = propertyArg.getBody() as PropertyAccessExpression;

            const key = body.getLastChildByKind(SyntaxKind.Identifier).getText();

            relations.push({
                name: prop.getName(),
                key,
                type,
                relationType: relationDecorator.getName()
            });
       }
    }

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

        for (const {name,type,relationType} of relations) {
            if (relationType === "ManyToMany" || relationType === "OneToMany") {
                const array = object[`${camelCase(name)}Ids`] = [];
                while (array.length < rows) {
                    const max = Faker.random.number(rows - 1) + 1;
                    array.push(max);
                }
            }else{
                object[`${camelCase(name)}Id`] = Faker.random.number(rows - 1) + 1;
            }
        }   

        data.push(object);
    }

    const ejsTemplateFile = fs.readFileSync(__dirname + '/../templates/mirageData.ejs','utf-8');

    const compiled = ejs.compile(ejsTemplateFile)({
        modelName : theClass.getName(),
        data : stringifyObject(data)
    });

    await mkdirp("fixtures");
    writeFileSync(`fixtures/${kebabCase(plural(model))}.js`,compiled);
}

export default async function generateMirageModelAction(model: string,rows: number,excludedModels = []) {
    if (model) {
        const file = project.getSourceFileOrThrow(`./src/api/models/${kebabCase(model)}.model.ts`);        
        await generateModelData(file,model,rows);
    }else{
        for (const file of project.getSourceFiles(`./src/api/models/*.model.ts`).filter((modelFile) => {
            return !excludedModels.includes(modelFile.getBaseNameWithoutExtension().replace(".model",""));
        })) {
            console.log(file.getBaseNameWithoutExtension());
            await generateModelData(file,file.getBaseNameWithoutExtension().replace(".model",""),rows);
        }
    }
}