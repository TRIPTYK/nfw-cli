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
    {template: 'controller', dest: 'controllers', ext: 'ts'},
    {template: 'repository', dest: 'repositories', ext: 'ts'},
    {template: 'validation', dest: 'validations', ext: 'ts'},
    {template: 'route', dest: 'routes/v1', ext: 'ts'},
    {template: 'test', dest: '../../test', ext: 'js'},
    {template: 'serializer', dest: 'serializers', ext: 'ts'},
    {template: 'relations', dest: 'enums/relations', ext: 'ts'},
    {template: 'middleware', dest: 'middlewares', ext: 'ts'},
    {template: 'model', dest: 'models', ext: 'ts'},
];

/**
 * @description Specific entities that already exists in the boilerplate
 * @type {string[]}
 */
exports.noGenerate = [
    'user', 'document', 'refresh_token', 'migration_table'
];