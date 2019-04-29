/**
 * @module resources
 * @author Amaury Deflorenne
 * @author Samuel Antoine
 * @author Verliefden Romain
 * @description Static resources for project
 */

/**
 * @description Array of each element to generate with the provided entity
 * @type {object[]}
 */
exports.items = [
    {template: 'controller', path : 'src/api/controllers' },
    {template: 'repository', path : 'src/api/repositories'},
    {template: 'validation', path: 'src/api/validations'},
    {template: 'route',  path :'src/api/routes/v1'},
    {template: 'test',  path :'test'},
    {template: 'serializer', path :'src/api/serializers' },
    {template: 'relations',  path :'src/api/enums/relations'},
    {template: 'middleware',  path :'src/api/middlewares'},
    {template: 'model',  path :'src/api/models'},
];

/**
 * @description Specific entities that already exists in the boilerplate
 * @type {string[]}
 */
exports.noGenerate = [
    'user', 'document', 'refresh_token', 'migration_table'
];