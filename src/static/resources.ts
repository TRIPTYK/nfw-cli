/**
 * @module resources
 * @author Amaury Deflorenne
 * @author Samuel Antoine
 * @author Verliefden Romain
 * @description Static resources for project
 */

 
 //description : Array of each element to generate with the provided entity
export const items: any[] = [
    {template: 'controller', path : 'src/api/controllers' },
    {template: 'repository', path : 'src/api/repositories'},
    {template: 'validation', path: 'src/api/validations'},
    {template: 'schema', path: 'src/api/serializers/schemas'},
    {template: 'test',  path :'test'},
    {template: 'serializer', path :'src/api/serializers' },
    {template: 'enum',  path :'src/api/enums/json-api'},
    {template: 'model',  path :'src/api/models'},
];