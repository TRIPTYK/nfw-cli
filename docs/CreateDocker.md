# CreateDocker
Create a MySQL container with a database of the same name inside.
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
$ nfw docker <name> --port <port>
```
### --user
- Description: Username of the created user.
- Type: string
- Default: user
- Example:
```sh
$ nfw docker <name> --user <user>
```
### --password
- Description: Password of the user.
- Type: string
- Default: password
- Example:
```sh
$ nfw docker <name> --password <password>
```
### --rootPassword
- Description: Password of root.
- Type: string
- Default: root
- Example:
```sh
$ nfw docker <name> --rootPassword <rootPassword>
```
### --nativePassword
- Description: Set the default authentication plugin to mysql_native_password (useful for development purpose).
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
- Description: Prevent the creation of the db in the container.
- Type: boolean
- Default: false
- Example:
```sh
$ nfw docker <name> --noDb 
```