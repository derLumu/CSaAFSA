
# Nest-lieh

Nest-lieh is a helper Libary supporting you documenting exceptions completely and correctly in NestJS.
It support the usage of nestjs/swagger exception documentation as well as the usage of nestia exception documentation.
In addition to this, Nest-lieh helps you tracking metrics about your endpoints and datatypes.

##### Nest-lieh consists of two tools:
- A command line based [static analyser](src/README.md)
- A TypeScript [language server plugin](src/serverPlugin/README.md) for dynamic assistence

## Installation

1. Download the Package from NPM 
```sh
npm i @derlumu/nest-lieh
```

2. Create a file and name it `nest-lieh.config.json`

3. Add to `nest-lieh.config.json`
```
{
  "frontendPath": <if-exists>,
}
```

4. Add to `tsconfig.json`
```
"compilerOptions": {
  "plugins": [
    { 
      "name": "@derlumu/nest-lieh" ,
      "configPath": <path-to-your-config-file>
    }
  ]
}
```

5. Restart your IDE or Language Server

## Usage

After restarting your IDE or Language Server the language server plugin is activated.
To start the static analyser run
```sh
npx @derlumu/nest-lieh <path-to-backend> <path-to-config-file>
```

## Functionallity

This sections contains a short oberview of nest-lieh`s functions.
For an in depth view on the technical background of the functions please follow the links to the [static analyser](src/README.md) and [language server plugin](src/serverPlugin/README.md)

##### Mapping method calls to exceptions

Exception mapping allows you to map any string to some exceptions.
This way you can tell Nest-lieh that some specific method calls may throw some specific exceptions.
You can add exception mappings by adding the following to your config file:

```
"mappedExceptions": [
    {
      "stringMatch": <string-to-match>,
      "ExceptionToHandle": <exception-class-name>
    }
  ]
```

By doing so the following result is achieved. 
When scanning for thrown exceptions, the analyser adds `exception-class-name` to the thrown exceptions every time `string-to-match` is a substring of a method call.


##### Identifing undocumented exceptions

Nest-lieh automatically scanns your endpoints for thrown exceptions.
Therefore it recursively traverses all from the endpoint called methods that are located in the backend directory.
Note that method calls in `node_modules` are not analysed. Use exception mapping if you use libary function that may throw exceptions.

##### Automatically document undocumented exceptions

If undocumented exceptions are identified, the correspoinsing controller method will be highlighted.
You will also find a quickfix documening the exceptions for you.

##### Identifying documented but not thrown exceptions

If you have unnecessary documented exceptions they are also identified and the corresponding method is highlighted.
The shown diagnostic then tells you which expeption is redundant.

##### Giving exeption metrics

Using the static analyser a metric for exceptions can be extracted.
This metric shows how many exceptions are thrown, how many are documented and how many are unnecessary documented.
It also shows some percentages in this matter.

##### (FE) Identifying unsued endpoints

If you have specified a frontend path in your config file, the usage of endpoints will be analysed.
Endpoints not used in the frontend will be marked as redundend.

##### Giving endpoint metrics

The static analyser also gives you some metrics for your endpoints.
It shows the number of endpoints, their uniqueness regarding name and url, as well as percentages in this matter.

##### Automatically generate update dto`s

After writing a datatype you can automatically generate a update type via a completion item.
The new datatype will be constructed using NestJS' `PartialType` utility function.

##### Giving datatype metrics

The static analyser also gives you some metrics for your datatypes.
It shows the number of datatypes, their uniqueness regarding name and attributes, as well as percentages in this matter.