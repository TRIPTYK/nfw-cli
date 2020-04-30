/**
 * @module createRelationAction
 * @author Verliefden Romain
 * @description creates relationship between 2 models
 */

// node modules
import {plural} from 'pluralize';
import stringifyObject = require('stringify-object');
import dashify = require('dashify');

// project object
import project = require('../utils/project');
import Log = require('../utils/log');

// project modules
import {modelFileExists, columnExist, relationExist, capitalizeEntity} from './lib/utils';
import { SyntaxKind, Node, PropertyAssignment } from 'ts-morph';


export class CreateRelationActionClass {

    model1: string;
    model2: string;
    relation: string;
    name: string;
    refCol: string;
    m1Name: string;
    m2Name: string;

    constructor(model1: string, model2: string, relation: string, name: string, refCol: string, m1Name: string, m2Name: string){
        this.model1 = model1;
        this.model2 = model2;
        this.relation = relation;
        this.name = name;
        this.refCol = refCol;
        this.m1Name = m1Name;
        this.m2Name = m2Name;
    }

    //description : Create a relationship between 2 models
    //relation : the relation you want between the two models
    //name : either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
    //refCol : for Oto only , name of the referenced column in the foreign key (must be primary or unique)
    async main () {

        if (!modelFileExists(this.model1) || !modelFileExists(this.model2))
        throw new Error("Both model should exist in order to create a many to many relationship");
        if (columnExist(this.model1, this.m2Name) || columnExist(this.model2, this.m1Name) || relationExist(this.model1, this.m2Name) || relationExist(this.model2, this.m1Name))
            throw new Error("A Column have a name that conflicts with the creation of the relationship in one or both models \n Please use m1Name and m2Name option");

        this._addRelation(this.model1, this.model2, true, this.relation, this.name, this.refCol, this.m1Name, this.m2Name);
        this._addRelation(this.model2, this.model1, false, this.relation, this.name, this.refCol, this.m2Name, this.m1Name);

        await project.save();
    }

    // TODO : fix relations adding l
    //description : add relationship in the serializer of an entity
    addToSerializer (entity: string, column: string, model, m1Name: string, m2Name: string) {
        const serializerFile = project.getSourceFile(`src/api/serializers/schemas/${entity}.serializer.schema.ts`);
        const serializerClass = serializerFile.getClasses()[0];

        const getter = serializerClass.getGetAccessor("schema").getBody();

        const [returnStatement] = getter.getChildrenOfKind(SyntaxKind.ReturnStatement);
        const [objectLiteralExpression] = returnStatement.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression) as any;

        objectLiteralExpression.getProperty("relationships").getInitializer().addPropertyAssignment({
            name: column,
            initializer: `{
type : ${capitalizeEntity(model)}SerializerSchema.type,
whitelist : ${capitalizeEntity(model)}SerializerSchema.serialize
}`
        });
        
        serializerFile.fixMissingImports();
        serializerFile.fixUnusedIdentifiers();

        Log.info(`Updated ${serializerFile.getFilePath()}`);
    };


    //Description : add relationship in the controller of an entity
    addToRelation (entity: string, column: string , otherModel) {
        const relationFile: any = project.getSourceFile(`src/api/enums/json-api/${entity}.enum.ts`);

        if (!relationFile) {
            Log.info("Cannot find relation enum file , skiping ...");
            return;
        }

        relationFile.getVariableDeclaration(`${entity}Relations`).getInitializer().addElement(`'${column}'`);

        relationFile.fixMissingImports();
        relationFile.fixUnusedIdentifiers();

        Log.info(`Updated ${relationFile.getFilePath()}`);
    };
    

    //description : build the string to write in a model for many to many relationship
    _Mtm = (modelClass, model1: string , model2: string, isFirst: boolean, name: string, m1Name: string,m2Name: string): [] => {
        const prop = modelClass.addProperty({ name: plural(m2Name), type: `${capitalizeEntity(model2)}[]` });
        const args = {};

        prop.addDecorator({name : "ManyToMany" , arguments : [`type => ${capitalizeEntity(model2)}`,`${model2} => ${model2}.${ plural(m1Name)}`]}).setIsDecoratorFactory(true);

        if (name) args['name'] = name;

        if (isFirst) prop.addDecorator({name : "JoinTable",arguments : [stringifyObject(args)]}).setIsDecoratorFactory(true);

        return prop.getName();
    };


    //description : build the string to write in a model for one to one relationship
    //name: name of the foreignKey in the table
    //refCol the column referenced in the foreign key
    //isFirst First in the relationship
    _Oto = (modelClass, model1: string , model2: string, isFirst: boolean, name: string, refCol: string, m1Name: string, m2Name: string): [] => {
        const prop = modelClass.addProperty({ name: m2Name, type: capitalizeEntity(model2) });
        const args = {};

        if (name) args['name'] = name;
        if (refCol) args['referencedColumnName'] = refCol;

        prop.addDecorator({name : "OneToOne" , arguments : [`type => ${capitalizeEntity(model2)}`,`${model2} => ${model2}.${m1Name}`]}).setIsDecoratorFactory(true);
        if (isFirst) prop.addDecorator({name : "JoinColumn",arguments : [stringifyObject(args)]}).setIsDecoratorFactory(true);

        return prop.getName();
    };


    //description : build the string to write in a model for one to many relationship
    _Otm = (modelClass, model1: string , model2: string, isFirst: boolean, m1Name: string, m2Name: string): [] => {
        let prop;

        if (isFirst) {
            prop = modelClass.addProperty({name: plural(m2Name), type: `${capitalizeEntity(model2)}[]`});
            prop.addDecorator({
                name: "OneToMany",
                arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${m1Name}`]
            }).setIsDecoratorFactory(true);
        }else {
            prop = modelClass.addProperty({name: m2Name, type: capitalizeEntity(model2)});
            prop.addDecorator({
                name: "ManyToOne",
                arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${plural(m1Name)}`]
            }).setIsDecoratorFactory(true);
        }

        return prop.getName();
    };


    //description : build the string to write in a model for one to many relationship
    _Mto = (modelClass, model1: string , model2: string, isFirst: boolean, m1Name: string, m2Name: string): [] => {
        let prop;

        if (isFirst) {
            prop = modelClass.addProperty({name: m2Name, type: capitalizeEntity(model2)});
            prop.addDecorator({
                name: "ManyToOne",
                arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${plural(m1Name)}`]
            }).setIsDecoratorFactory(true);
        }else {
            prop = modelClass.addProperty({name: plural(m2Name), type: `${capitalizeEntity(model2)}[]`});
            prop.addDecorator({
                name: "OneToMany",
                arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${m1Name}`]
            }).setIsDecoratorFactory(true);
        }

        return prop.getName();
    };


    //description : Define which relation need to be written in the model
    //refCol  for Oto only , name of the referenced column in the foreign key (must be primary or unique)
    //name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
    //isFirst Does he carry the foreignKey (Oto) or assure that you write JoinTable only in one side of the relation for mtm
    _addRelation = (model1: string, model2: string, isFirst: boolean, relation: string, name: string, refCol: string, m1Name: string, m2Name: string) => {
        let addedPropertyName;

        let modelFile = project.getSourceFile(`src/api/models/${model1}.model.ts`);
        const modelClass = modelFile.getClasses()[0];

        if (relation === 'mtm') addedPropertyName = this._Mtm(modelClass, model1 , model2 ,isFirst, name,m1Name,m2Name);
        if (relation === 'oto') addedPropertyName = this._Oto(modelClass, model1 , model2, isFirst, name, refCol,m1Name,m2Name);
        if (relation === 'otm') addedPropertyName = this._Otm(modelClass, model1 , model2, isFirst,m1Name,m2Name);
        if (relation === 'mto') addedPropertyName = this._Mto(modelClass, model1 , model2, isFirst,m1Name,m2Name);

        modelFile.fixMissingImports();

        Log.info(`Updated ${modelFile.getFilePath()}`);

        this.addToSerializer(model1, addedPropertyName,model2,m1Name,m2Name);
        this.addToRelation(model1, addedPropertyName,model2);
    };
}
