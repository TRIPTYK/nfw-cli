"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModelData = void 0;
const project = require("../utils/project");
const fs = require("fs");
const ejs = require("ejs");
const kebab_case_1 = require("@queso/kebab-case");
const pascalcase = require("pascalcase");
const ts_morph_1 = require("ts-morph");
const stringifyObject = require("stringify-object");
const camelCase = require("camelcase");
const Faker = require("faker");
const mkdirp = require("mkdirp");
const fs_1 = require("fs");
const pluralize_1 = require("pluralize");
async function generateModelData(file, model, rows) {
    const className = pascalcase(model);
    const [theClass] = file.getClasses();
    const elements = [];
    const data = [];
    const relations = [];
    for (let prop of theClass.getInstanceProperties().filter((p) => p.getName() !== 'id')) {
        let type;
        let length = null;
        const columnDecorator = prop.getDecorator("Column");
        if (columnDecorator) {
            const args = columnDecorator.getArguments();
            if (args.length === 1) { // @Column({...})
                for (const objectProp of args[0].getChildrenOfKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
                    const propertyName = objectProp.getFirstChildByKindOrThrow(ts_morph_1.SyntaxKind.Identifier).getText();
                    if (propertyName === "type") {
                        const text = objectProp.getInitializer().getText();
                        type = text.replace(/['"]+/g, '');
                    }
                    if (propertyName === "length") {
                        length = objectProp.getInitializer().getText();
                    }
                }
            }
            else if (args.length === 2) { // @Column("blah",{...})
                type = args[0].getText().replace(/['"]+/g, '');
            }
            if (!type) {
                type = prop.getType().getText();
            }
            console.log(type);
            elements.push({ name: prop.getName(), type, length });
        }
        let relationDecorator = prop.getDecorator("ManyToMany") ?? prop.getDecorator("OneToMany") ?? prop.getDecorator("OneToOne");
        if (relationDecorator && relationDecorator.getName() === "OneToOne" && !prop.getDecorator("JoinColumn")) {
            relationDecorator = null;
        }
        if (relationDecorator) {
            const [typeArg, propertyArg] = relationDecorator.getArguments();
            const type = typeArg.getBodyText();
            const body = propertyArg.getBody();
            const key = body.getLastChildByKind(ts_morph_1.SyntaxKind.Identifier).getText();
            relations.push({
                name: prop.getName(),
                key,
                type,
                relationType: relationDecorator.getName()
            });
        }
    }
    for (let index = 1; index <= rows; index++) {
        const object = { id: index };
        for (const { name, type, length } of elements) {
            let value = null;
            // arma 3 like syntax
            switch (true) {
                case ["string", "varchar"].includes(type):
                    value = Faker.lorem.text().substr(0, length ?? 255);
                    break;
                case ["Date", "timestamp", "datetime", "date"].includes(type):
                    value = Faker.date.recent();
                    break;
                case ["text"].includes(type):
                    value = Faker.lorem.text();
                    break;
                case ["simple-enum", "enum"].includes(type):
                    value = Faker.lorem.word();
                    break;
                case ["json", "simple-json", "object"].includes(type):
                    value = {};
                    break;
                case ["number", "integer", "float", "decimal", "int", "tinyint"].includes(type):
                    value = Faker.random.number(255);
                    break;
                case ["boolean"].includes(type):
                    value = Faker.random.boolean();
                    break;
            }
            object[camelCase(name)] = value;
        }
        for (const { name, type, relationType } of relations) {
            if (relationType === "ManyToMany" || relationType === "OneToMany") {
                const array = object[`${camelCase(pluralize_1.singular(name))}Ids`] = [];
                while (array.length < rows) {
                    const max = Faker.random.number(rows - 1) + 1;
                    array.push(max);
                }
            }
            else {
                object[`${camelCase(pluralize_1.singular(name))}Id`] = Faker.random.number(rows - 1) + 1;
            }
        }
        data.push(object);
    }
    const ejsTemplateFile = fs.readFileSync(__dirname + '/../templates/mirageData.ejs', 'utf-8');
    const compiled = ejs.compile(ejsTemplateFile)({
        modelName: theClass.getName(),
        data: stringifyObject(data)
    });
    await mkdirp("fixtures");
    fs_1.writeFileSync(`fixtures/${kebab_case_1.default(pluralize_1.plural(model))}.js`, compiled);
}
exports.generateModelData = generateModelData;
async function generateMirageModelAction(model, rows, excludedModels = []) {
    if (model) {
        const file = project.getSourceFileOrThrow(`./src/api/models/${kebab_case_1.default(model)}.model.ts`);
        await generateModelData(file, model, rows);
    }
    else {
        for (const file of project.getSourceFiles(`./src/api/models/*.model.ts`).filter((modelFile) => {
            return !excludedModels.includes(modelFile.getBaseNameWithoutExtension().replace(".model", ""));
        })) {
            console.log(file.getBaseNameWithoutExtension());
            await generateModelData(file, file.getBaseNameWithoutExtension().replace(".model", ""), rows);
        }
    }
}
exports.default = generateMirageModelAction;
