# CreateDocker
Creates a MySQL container with a database of the same name inside.
## Usage:
```sh
$ nfw docker <name>
```
## Alias(es):
dock
## Options
### --port
- Description: Listening port of the server.
- Type: number
- Default: 3306
- Example:
```sh
$ nfw docker <name> --port <value for port>
```
### --user
- Description: Username of the created user.
- Type: string
- Default: user
- Example:
```sh
$ nfw docker <name> --user <value for user>
```
### --password
- Description: Password of the user.
- Type: string
- Default: password
- Example:
```sh
$ nfw docker <name> --password <value for password>
```
### --rootPassword
- Description: Password of root.
- Type: string
- Default: root
- Example:
```sh
$ nfw docker <name> --rootPassword <value for rootPassword>
```
### --nativePassword
- Description: Sets the default authentication plugin to mysql_native_password (useful for development purpose).
- Type: boolean
- Default: false
- Example:
```sh
$ nfw docker <name> --nativePassword 
```
### --noRun
- Description: Only creates the container, without running it.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw docker <name> --noRun 
```
### --noDb
- Description: Prevents the creation of the db in the container.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw docker <name> --noDb 
```