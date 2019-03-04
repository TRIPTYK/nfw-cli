# Node FrameWork

This repository contains a CLI based app that generate a NodeJs API base on [3rd_party_ts_boilerplate](https://github.com/AmauryD/3rd-party-ts-boilerplate)

Commands :

* [nfw new](#New)
* [nfw test]()
* [nfw generate]()
* [nfw import]()
* [nfw delete]()
* [nfw info]()
* [nfw start]()
* [nfw migrate]()

# New

Command :

 ```bash
 $ nfw new 
 ```
#### Description

Generate a new project. Ask if the path is right, if not it asks for a new one, then ask for a name.

![](readme/new.gif)
### Option

* --env

Usage

```bash
$ nfw new --env
```
#### Description

Generate a new project asking for environement variables such as :

* Environement      ("Development"/"Production"/"Staging"/"Test")
* Port              <Integer>(Ex : 8000)
* Database Host     (Ex : localhost or your-domain.org)
* Database Username (Ex : root or User1)
* Database Passord  (Hidden by default)
* Database port     (ex : 3306)
* Path validation 
    * New path 
* Project Name      (Ex: my_new_project)

![](readme/new_env.gif)