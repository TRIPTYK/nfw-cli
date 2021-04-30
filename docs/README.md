```sh
$ nfw <command>

Commands:
  nfw add-column <entity> <propertyName>    Adds a column in the target entity
                                                                [aliases: adcol]
  nfw add-endpoint <prefix> <endpoint>      Adds an endpoint to a specific
  <method>                                  route.              [aliases: adend]
  nfw add-perms                             Adds permissions for any route of
                                            any entity          [aliases: adper]
  nfw add-relation <entity> <target>        Adds relation between entity
  <name> <inverseName> <isNullable>                             [aliases: adrel]
  nfw add-role <roleName>                   Adds roles for permissions
                                                                 [aliases: adro]
  nfw docker <name>                         Creates a MySQL container with a
                                            database of the same name inside.
                                                                 [aliases: dock]
  nfw del-column <entity> <columnName>      Removes a column in the target
                                            entity             [aliases: delcol]
  nfw del-endpoint <prefix> <subroute>      Deletes an endpoint of a specific
  <requestMethod>                           route.             [aliases: delend]
  nfw del-entity <entityName>               Deletes an entity
                                                            [aliases: delentity]
  nfw del-perms                             Removes permissions for any route of
                                            any entity         [aliases: delper]
  nfw del-relation <entity> <relationName>  Removes relation between entity
                                                               [aliases: delrel]
  nfw del-role                              Deletes roles       [aliases: delro]
  nfw del-route [prefix]                    Deletes a generated route.
                                                             [aliases: delroute]
  nfw generate-entity <name>                Generates an entity
                                                            [aliases: genentity]
  nfw generate-route <prefix> [methods..]   Generates a basic route.
                                                             [aliases: genroute]
  nfw init                                  Initiation of environment variables
                                            and the database.     [aliases: ini]
  nfw list <kind>                           Lists all objects of a given kind.
                                                                   [aliases: ls]
  nfw new <path>                            Creates a new project.  [aliases: n]

Options:
  --version  Show version number                                       [boolean]
  ----help

```